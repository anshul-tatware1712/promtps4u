import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { chromium } from 'playwright';
import { ScreenshotService } from './screenshot.service';
import { HtmlCleanerService } from './html-cleaner.service';
import { AiService, DetectedComponent } from '../ai/ai.service';
import { PagesService } from './pages.service';
import { DeepScrapeResult, ScrapeJob } from './scraper.types';
import * as crypto from 'crypto';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly screenshotService: ScreenshotService,
    private readonly cleanerService: HtmlCleanerService,
    private readonly aiService: AiService,
    private readonly pagesService: PagesService,
  ) {}

  async processScrapeJob(job: Job<ScrapeJob>): Promise<{ promptCount: number }> {
    const { pageId, url } = job.data;
    this.logger.log(`Starting scrape: ${url}`);

    let browser: any = null;

    try {
      // Launch browser
      await this.pagesService.updateStatus(pageId, 'scraping');
      await job.progress(5);
      this.logger.log('Launching browser...');

      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Desktop scrape
      const desktopCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
      });
      const page = await desktopCtx.newPage();

      await page.route('**/*.{mp4,webm,ogg,mp3,wav}', (route) => route.abort());

      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

      await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
          window.scrollTo(0, document.body.scrollHeight * (i / 4));
          await new Promise((r) => setTimeout(r, 400));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);

      await job.progress(20);
      this.logger.log('Page loaded, extracting content...');

      // Extract content
      const [title, desktopHtml, screenshotBuffer] = await Promise.all([
        page.title(),
        page.content(),
        page.screenshot({ fullPage: true }) as Promise<Buffer>,
      ]);

      // Extract interaction states, animations, SVGs
      const [interactionStates, animations, svgElements] = await Promise.all([
        this.extractInteractionStates(page),
        this.extractAnimations(page),
        this.extractSvgElements(page),
      ]);

      await job.progress(40);

      // Mobile + tablet snapshots
      this.logger.log('Capturing responsive snapshots...');

      const mobileCtx = await browser.newContext({
        viewport: { width: 375, height: 812 },
      });
      const mobilePage = await mobileCtx.newPage();
      await mobilePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const mobileHtml = await mobilePage.content();
      await mobileCtx.close();

      const tabletCtx = await browser.newContext({
        viewport: { width: 768, height: 1024 },
      });
      const tabletPage = await tabletCtx.newPage();
      await tabletPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const tabletHtml = await tabletPage.content();
      await tabletCtx.close();

      await browser.close();
      await job.progress(55);

      // Screenshot upload
      this.logger.log('Uploading screenshot...');
      const screenshotUrl = await this.screenshotService.uploadFullPage(
        pageId,
        screenshotBuffer,
      );
      await job.progress(60);

      // HTML cleaning
      this.logger.log('Cleaning HTML...');
      const { cleanedHtml, cssTokens, fontsUsed, colorPalette } =
        this.cleanerService.deepClean(desktopHtml);
      await job.progress(65);

      // AI Component Detection
      await this.pagesService.updateStatus(pageId, 'detecting');
      this.logger.log('Running AI component detection...');

      const scrapeResult: DeepScrapeResult = {
        url,
        title,
        html: desktopHtml,
        cleanedHtml,
        screenshotBuffer,
        cssTokens,
        interactionStates,
        animations,
        svgElements,
        styleSnapshots: [],
        fontsUsed,
        colorPalette,
        scrollDepth: 5,
        responsiveHtml: {
          mobile: mobileHtml,
          tablet: tabletHtml,
          desktop: desktopHtml,
        },
      };

      const components = await this.aiService.detectComponents(scrapeResult);
      await job.progress(75);
      this.logger.log(`Detected ${components.length} components`);

      // Save components to DB
      this.logger.log('Saving components to database...');
      const savedComponents = await this.pagesService.saveComponents(
        pageId,
        components,
      );
      await job.progress(80);

      // Generate prompts
      await this.pagesService.updateStatus(pageId, 'generating');
      this.logger.log('Generating prompts for components...');

      const promptResults = await Promise.all(
        savedComponents.map(async (component: any, index: number) => {
          const componentData: DetectedComponent = {
            id: component.id,
            type: component.componentType,
            title: `${component.designStyle || ''} ${component.componentType}`.trim(),
            position: component.positionOnPage,
            colorScheme: component.colorScheme,
            designStyle: component.designStyle,
            layout: component.layoutDescription
              ? JSON.parse(component.layoutDescription)
              : null,
            interactiveElements: component.interactionStates,
            animations: component.animations,
            colorTokens: component.cssTokens,
            svgElements: component.svgElements,
            responsiveBehavior: component.responsiveBehavior,
            boundingBox: null,
          };

          let cropUrl = screenshotUrl;
          if (componentData.boundingBox) {
            cropUrl = await this.screenshotService.cropComponent(
              screenshotBuffer,
              component.id,
              componentData.boundingBox,
            );
          }

          const promptText = await this.aiService.generatePrompt(
            componentData,
            scrapeResult,
          );

          const suggestedImages = await this.aiService.suggestMedia(componentData);

          return {
            componentId: component.id,
            promptText,
            componentType: component.componentType,
            title: componentData.title,
            screenshotUrl: cropUrl,
            suggestedImages,
            tags: this.generateTags(componentData),
          };
        }),
      );

      await job.progress(90);

      // Save prompts to DB
      this.logger.log('Saving prompts to database...');
      await this.pagesService.savePrompts(pageId, promptResults);
      await job.progress(95);

      // Mark page as done
      await this.pagesService.markDone(pageId, screenshotUrl, title);
      await job.progress(100);

      this.logger.log(
        `Scrape complete: ${url} → ${promptResults.length} prompts generated`,
      );

      return { promptCount: promptResults.length };
    } catch (error) {
      this.logger.error(`Scrape failed: ${url}`, error);
      await this.pagesService.markFailed(pageId, error.message);

      if (browser) {
        await browser.close().catch(() => {});
      }
      throw error;
    }
  }

  /**
   * Generate tags from component
   */
  private generateTags(component: DetectedComponent): string[] {
    const tags: string[] = [];

    if (component.colorScheme) tags.push(component.colorScheme);
    if (component.designStyle) tags.push(component.designStyle);
    if (component.specialEffects) tags.push(...component.specialEffects);
    if (component.mediaElements?.hasVideo) tags.push('video-bg');
    if (component.animations?.length) tags.push('animated');

    return tags;
  }

  /**
   * Extract interaction states (hover, focus, active, disabled) with full CSS properties
   */
  private async extractInteractionStates(page: any) {
    try {
      const ALL_STATES = ['hover', 'focus', 'focus-visible', 'active'];

      const ALL_PROPERTIES = [
        // Box model
        'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
        'borderBottomColor', 'borderLeftColor', 'borderWidth', 'borderRadius',
        'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',

        // Shadows & effects
        'boxShadow', 'outline', 'outlineColor', 'outlineWidth', 'outlineOffset',
        'opacity', 'filter', 'backdropFilter',

        // Transform & transition
        'transform', 'transformOrigin', 'transition', 'transitionDuration',
        'transitionTimingFunction', 'transitionDelay', 'transitionProperty',

        // Typography
        'color', 'textDecoration', 'textDecorationColor', 'fontStyle', 'fontWeight',
        'letterSpacing', 'textTransform',

        // Layout
        'width', 'height', 'padding', 'gap',

        // Positioning
        'position', 'top', 'right', 'bottom', 'left', 'zIndex',

        // Visual
        'visibility', 'clipPath', 'backgroundImage', 'backgroundSize',
        'backgroundPosition', 'objectFit', 'objectPosition'
      ];

      // Selectors to target - expanded beyond just nav/buttons
      const TARGET_SELECTORS = [
        // Navigation
        'nav a', 'nav button', '.nav-link', '.nav-item', '[role="navigation"] a',
        'header button', 'header a', '.header-nav a', '.menu-item',

        // Buttons & CTAs
        '[class*="btn"]', '[class*="button"]', '[role="button"]',
        'button', 'a[href]', 'input[type="submit"]',

        // Form elements
        'input', 'textarea', 'select', '[role="textbox"]',

        // Cards & interactive containers
        '[class*="card"]', '[role="listitem"]', '[tabindex]:not([tabindex="-1"])',

        // Common interactive patterns
        '.dropdown', '.accordion-trigger', '.tab-trigger', '.modal-trigger',
        '[aria-expanded]', '[aria-controls]', '[data-state]',

        // Framework specific
        '.chakra-button', '.mui-button', '.ant-btn', '.el-button'
      ];

      const elements = await page.$$(TARGET_SELECTORS.join(', '));
      const states = [];

      for (const el of elements.slice(0, 50)) {
        try {
          const elementInfo = await el.evaluate((node: any) => {
            const getSelector = (n: any) => {
              if (n.id) return `#${n.id}`;
              if (n.className && typeof n.className === 'string') {
                const classes = n.className.split(' ').filter((c: string) => c && !c.startsWith('css-')).slice(0, 2);
                if (classes.length) return `${n.tagName.toLowerCase()}.${classes.join('.')}`;
              }
              return n.tagName.toLowerCase();
            };

            return {
              selector: getSelector(node),
              tagName: node.tagName,
              id: node.id,
              className: node.className,
              role: node.getAttribute('role'),
              ariaLabel: node.getAttribute('aria-label'),
              textContent: node.textContent?.trim().slice(0, 50),
              defaultClasses: node.className,
              dataState: node.getAttribute('data-state'),
            };
          });

          // Capture default state
          const defaultStyles = await el.evaluate((node: any) => {
            const computed = (node as any).ownerDocument.defaultView.getComputedStyle(node);
            const result: any = {};
            ALL_PROPERTIES.forEach((prop: string) => {
              result[prop] = computed[prop as keyof CSSStyleDeclaration] as string;
            });
            return result;
          });

          for (const state of ALL_STATES) {
            try {
              let stateTriggered = false;

              // Trigger the state
              switch (state) {
                case 'hover':
                  await el.hover();
                  stateTriggered = true;
                  break;
                case 'focus':
                case 'focus-visible':
                  await el.focus();
                  stateTriggered = true;
                  break;
                case 'active':
                  await el.click();
                  stateTriggered = true;
                  break;
              }

              if (!stateTriggered) continue;
              await page.waitForTimeout(200);

              // Capture state styles
              const stateStyles = await el.evaluate((node: any) => {
                const computed = (node as any).ownerDocument.defaultView.getComputedStyle(node);
                const result: any = {};
                ALL_PROPERTIES.forEach((prop: string) => {
                  result[prop] = computed[prop as keyof CSSStyleDeclaration] as string;
                });
                return result;
              });

              // Capture class changes
              const currentClasses = await el.evaluate((node: any) => node.className);

              // Calculate differences
              const styleChanges: any = {};
              const classChanges: string[] = [];

              Object.entries(stateStyles).forEach(([key, value]) => {
                if (value !== (defaultStyles as any)[key] && value) {
                  styleChanges[key] = {
                    from: (defaultStyles as any)[key] || 'initial',
                    to: value
                  };
                }
              });

              if (currentClasses !== elementInfo.defaultClasses) {
                const defaultClassList = elementInfo.defaultClasses.split(' ').filter(Boolean);
                const currentClassList = currentClasses.split(' ').filter(Boolean);
                classChanges.push(
                  ...currentClassList.filter((c: string) => !defaultClassList.includes(c)),
                  ...defaultClassList.filter((c: string) => !currentClassList.includes(c)).map((c: string) => `-${c}`)
                );
              }

              // Record if anything changed
              if (Object.keys(styleChanges).length > 0 || classChanges.length > 0) {
                states.push({
                  ...elementInfo,
                  stateName: state,
                  styleChanges: Object.keys(styleChanges).length > 0 ? styleChanges : undefined,
                  classChanges: classChanges.length > 0 ? classChanges : undefined,
                  tailwindHints: this.generateTailwindHints(styleChanges)
                });
              }

              // Reset state
              await el.evaluate((n: any) => n.blur());
              await page.waitForTimeout(100);

            } catch (stateError) {
              // Continue to next state
            }
          }
        } catch (elError) {
          // Continue to next element
        }
      }

      return states;
    } catch (error) {
      this.logger.error(`Failed to extract interaction states: ${error.message}`);
      return [];
    }
  }

  /**
   * Helper to generate Tailwind hints from style changes
   */
  private generateTailwindHints(styleChanges: any): string[] {
    const hints: string[] = [];

    if (styleChanges.backgroundColor) {
      hints.push(`bg: ${styleChanges.backgroundColor.from} → ${styleChanges.backgroundColor.to}`);
    }
    if (styleChanges.color) {
      hints.push(`text: ${styleChanges.color.from} → ${styleChanges.color.to}`);
    }
    if (styleChanges.boxShadow) {
      hints.push(`shadow: ${styleChanges.boxShadow.from} → ${styleChanges.boxShadow.to}`);
    }
    if (styleChanges.transform && styleChanges.transform.to !== 'none') {
      hints.push(`transform: ${styleChanges.transform.to}`);
    }
    if (styleChanges.opacity) {
      hints.push(`opacity: ${styleChanges.opacity.from} → ${styleChanges.opacity.to}`);
    }
    if (styleChanges.borderColor) {
      hints.push(`border: ${styleChanges.borderColor.from} → ${styleChanges.borderColor.to}`);
    }

    return hints;
  }

  /**
   * Extract CSS animations from page - keyframes, transitions, transforms
   */
  private async extractAnimations(page: any) {
    try {
      return await page.evaluate(() => {
        const animations: any[] = [];

        // 1. Capture @keyframes from stylesheets
        const sheets = Array.from(document.styleSheets);
        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules || []) as CSSRule[];
            for (const rule of rules) {
              if (rule instanceof CSSKeyframesRule) {
                const keyframeName = rule.name;

                // Find elements using this animation
                document.querySelectorAll('*').forEach((el) => {
                  const style = window.getComputedStyle(el);
                  if (style.animationName && style.animationName.includes(keyframeName)) {
                    animations.push({
                      type: 'keyframes',
                      selector: el.id ? `#${el.id}` :
                               el.className ? `.${Array.from(el.classList).join('.')}` :
                               el.tagName.toLowerCase(),
                      animationName: style.animationName,
                      duration: style.animationDuration,
                      timingFunction: style.animationTimingFunction,
                      delay: style.animationDelay,
                      iterationCount: style.animationIterationCount,
                      direction: style.animationDirection,
                      fillMode: style.animationFillMode,
                      keyframeRules: Array.from(rule.cssRules)
                        .map((r: any) => `${r.keyText} { ${r.style.cssText} }`)
                        .join(' ')
                        .slice(0, 500)
                    });
                  }
                });
              }

              // 2. Capture transition rules
              if (rule instanceof CSSStyleRule) {
                const style = (rule as CSSStyleRule).style;
                if (style.transition && style.transition !== 'none') {
                  animations.push({
                    type: 'transition',
                    selector: (rule as CSSStyleRule).selectorText,
                    transition: style.transition,
                    transitionProperty: style.transitionProperty,
                    transitionDuration: style.transitionDuration,
                    transitionTimingFunction: style.transitionTimingFunction,
                    transitionDelay: style.transitionDelay
                  });
                }
              }
            }
          } catch (e) {
            // Skip inaccessible stylesheets (CORS)
          }
        }

        // 3. Capture inline animation styles
        document.querySelectorAll('[style*="animation"], [style*="transition"]').forEach((el) => {
          const inlineStyle = el.getAttribute('style') || '';
          const computed = window.getComputedStyle(el);

          if (inlineStyle.includes('animation') || computed.animation !== 'none') {
            animations.push({
              type: 'inline',
              selector: el.id ? `#${el.id}` :
                       el.className ? `.${Array.from(el.classList).join('.')}` :
                       el.tagName.toLowerCase(),
              inlineStyle: inlineStyle.slice(0, 300),
              computedAnimation: {
                name: computed.animationName,
                duration: computed.animationDuration,
                timingFunction: computed.animationTimingFunction,
                delay: computed.animationDelay
              }
            });
          }
        });

        // 4. Capture transform values (for hover/interaction animations)
        document.querySelectorAll('[class*="transform"], [class*="transition"]').forEach((el) => {
          const computed = window.getComputedStyle(el);
          if (computed.transform !== 'none' || computed.transition !== 'none') {
            animations.push({
              type: 'transform',
              selector: el.id ? `#${el.id}` :
                       el.className ? `.${Array.from(el.classList).join('.')}` :
                       el.tagName.toLowerCase(),
              transform: computed.transform,
              transformOrigin: computed.transformOrigin,
              transition: computed.transition
            });
          }
        });

        // Deduplicate by selector+type
        const seen = new Set();
        return animations.filter((a) => {
          const key = `${a.type}-${a.selector}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    } catch (error) {
      this.logger.error(`Failed to extract animations: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract SVG elements from page
   */
  private async extractSvgElements(page: any) {
    try {
      return page.evaluate(() => {
        const svgs = Array.from(document.querySelectorAll('svg'));
        return svgs.slice(0, 30).map((svg: any) => ({
          selector: svg.id
            ? `#${svg.id}`
            : svg.className
            ? `.${String(svg.className).split(' ')[0]}`
            : 'svg',
          markup: svg.outerHTML.slice(0, 2000), // Cap at 2KB per SVG
          purpose: '', // AI fills this later
          isAnimated:
            svg.innerHTML.includes('animate') ||
            svg.innerHTML.includes('@keyframes'),
        }));
      });
    } catch {
      return [];
    }
  }
}
