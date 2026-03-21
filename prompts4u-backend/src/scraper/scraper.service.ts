import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { chromium } from 'playwright';
import { ScreenshotService } from './screenshot.service';
import { HtmlCleanerService } from './html-cleaner.service';
import { DeepScrapeResult, ScrapeJob } from './scraper.types';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly screenshotService: ScreenshotService,
    private readonly cleanerService: HtmlCleanerService,
  ) {}

  /**
   * Process a scrape job - full pipeline
   */
  async processScrapeJob(job: Job<ScrapeJob>): Promise<{ promptCount: number }> {
    const { pageId, url } = job.data;
    this.logger.log(`Starting scrape: ${url}`);

    let browser: any = null;

    try {
      // ── STAGE 1: Launch browser ─────────────────────────────────
      await job.progress(5);
      this.logger.log('Launching browser...');

      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // ── STAGE 2: Desktop scrape ─────────────────────────────────
      const desktopCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
      });
      const page = await desktopCtx.newPage();

      // Block media files to speed up load (we want HTML structure, not assets)
      await page.route('**/*.{mp4,webm,ogg,mp3,wav}', (route) => route.abort());

      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

      // Scroll to trigger lazy-loaded content
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

      // ── STAGE 3: Extract everything ─────────────────────────────
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

      // ── STAGE 4: Mobile + tablet snapshots ──────────────────────
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

      // ── STAGE 5: Screenshot upload ───────────────────────────────
      this.logger.log('Uploading screenshot...');
      const screenshotUrl = await this.screenshotService.uploadFullPage(
        pageId,
        screenshotBuffer,
      );
      await job.progress(60);

      // ── STAGE 6: HTML cleaning ───────────────────────────────────
      this.logger.log('Cleaning HTML...');
      const { cleanedHtml, cssTokens, fontsUsed, colorPalette } =
        this.cleanerService.deepClean(desktopHtml);
      await job.progress(65);

      // ── STAGE 7: Prepare result for AI processing ────────────────
      this.logger.log('Preparing data for AI detection...');

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
        fontsUsed,
        colorPalette,
        scrollDepth: 5,
        responsiveHtml: {
          mobile: mobileHtml,
          tablet: tabletHtml,
          desktop: desktopHtml,
        },
      };

      // For now, log the result - AI processing will be added in Phase 6
      this.logger.log(
        `Scrape complete: ${url} - ${cleanedHtml.length} chars cleaned HTML`,
      );
      this.logger.log(
        `Extracted: ${interactionStates.length} interactions, ${animations.length} animations, ${svgElements.length} SVGs`,
      );

      await job.progress(100);

      // Return placeholder - actual prompt count will come from AI service
      return { promptCount: 1 };
    } catch (error) {
      this.logger.error(`Scrape failed: ${url}`, error);
      if (browser) {
        await browser.close().catch(() => {});
      }
      throw error;
    }
  }

  /**
   * Extract interaction states (hover, open, closed, etc.)
   */
  private async extractInteractionStates(page: any) {
    try {
      const states: any[] = [];

      // Capture hover states on nav items, buttons, links
      const hoverTargets = await page.$$(
        'nav a, nav button, .nav-link, header button, [class*="btn"], [class*="button"], a[href]',
      );

      for (const el of hoverTargets.slice(0, 20)) {
        try {
          const selector = await el.evaluate((node: any) => {
            if (node.id) return `#${node.id}`;
            if (node.className)
              return `${node.tagName.toLowerCase()}.${node.className.split(' ')[0]}`;
            return node.tagName.toLowerCase();
          });

          const beforeStyles = await el.evaluate((n: any) => {
            const s = window.getComputedStyle(n);
            return {
              bg: s.backgroundColor,
              color: s.color,
              transform: s.transform,
              opacity: s.opacity,
            };
          });

          await el.hover();
          await page.waitForTimeout(300);

          const afterStyles = await el.evaluate((n: any) => {
            const s = window.getComputedStyle(n);
            return {
              bg: s.backgroundColor,
              color: s.color,
              transform: s.transform,
              opacity: s.opacity,
            };
          });

          // Only record if something changed
          if (JSON.stringify(beforeStyles) !== JSON.stringify(afterStyles)) {
            const cssChanges = Object.entries(afterStyles)
              .filter(([k, v]) => v !== (beforeStyles as any)[k])
              .map(([k, v]) => `${k}: ${v}`);

            states.push({
              stateName: 'hover',
              selector,
              cssChanges,
            });
          }
        } catch {
          // Skip failed extractions
        }
      }

      return states;
    } catch {
      return [];
    }
  }

  /**
   * Extract CSS animations from page
   */
  private async extractAnimations(page: any) {
    try {
      return page.evaluate(() => {
        const animations: any[] = [];
        const sheets = Array.from(document.styleSheets);

        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              // Capture @keyframes
              if (rule instanceof CSSKeyframesRule) {
                // Find elements using this animation
                const allEls = document.querySelectorAll('*');
                allEls.forEach((el: any) => {
                  const style = window.getComputedStyle(el);
                  if (style.animationName === rule.name) {
                    animations.push({
                      selector: el.id
                        ? `#${el.id}`
                        : el.className
                        ? `.${String(el.className).split(' ')[0]}`
                        : el.tagName.toLowerCase(),
                      animationName: rule.name,
                      duration: style.animationDuration,
                      easing: style.animationTimingFunction,
                      delay: style.animationDelay,
                      keyframes: rule.cssText.slice(0, 500), // Cap at 500 chars
                    });
                  }
                });
              }
            }
          } catch {
            // Skip inaccessible stylesheets
          }
        }
        return animations;
      });
    } catch {
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
