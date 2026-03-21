import { Injectable, Logger } from '@nestjs/common';
import { PerplexityClient } from './perplexity.client';
import { MediaSuggesterService, SuggestedMedia } from './media-suggester.service';
import { DETECT_SYSTEM_PROMPT } from './system-prompts/detect.prompt';
import { GENERATE_SYSTEM_PROMPT } from './system-prompts/generate.prompt';
import { DeepScrapeResult } from '../scraper/scraper.types';

export interface DetectedComponent {
  id: string;
  type: string;
  title: string;
  position: number;
  colorScheme?: string;
  designStyle?: string;
  layout?: any;
  typography?: any;
  colorTokens?: any;
  interactiveElements?: any[];
  animations?: any[];
  svgElements?: any[];
  mediaElements?: any;
  responsiveBehavior?: string;
  specialEffects?: string[];
  contentPattern?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly perplexity: PerplexityClient,
    private readonly mediaSuggester: MediaSuggesterService,
  ) {}

  /**
   * Detect components from scraped HTML
   */
  async detectComponents(scrapeResult: DeepScrapeResult): Promise<DetectedComponent[]> {
    this.logger.log('Detecting components with AI...');

    // Build context for the AI
    const userContent = JSON.stringify({
      url: scrapeResult.url,
      title: scrapeResult.title,
      htmlSample: scrapeResult.cleanedHtml.slice(0, 60000),
      cssTokens: scrapeResult.cssTokens,
      interactionStates: scrapeResult.interactionStates,
      animations: scrapeResult.animations,
      svgElements: scrapeResult.svgElements.map((s) => ({
        ...s,
        markup: s.markup.slice(0, 500), // cap each SVG
      })),
      responsiveHtml: {
        mobile: scrapeResult.responsiveHtml.mobile.slice(0, 10000),
      },
      fontsUsed: scrapeResult.fontsUsed,
    });

    const raw = await this.perplexity.chat(DETECT_SYSTEM_PROMPT, userContent, true);

    let components: DetectedComponent[];
    try {
      const parsed = JSON.parse(raw);
      components = Array.isArray(parsed) ? parsed : parsed.components || [];

      // Add unique IDs
      components = components.map((c, index) => ({
        ...c,
        id: `comp_${Date.now()}_${index}`,
      }));

      this.logger.log(`Detected ${components.length} components`);
    } catch (error) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      this.logger.debug(`Raw response: ${raw.slice(0, 500)}`);
      throw new Error(`AI detection returned invalid JSON: ${raw.slice(0, 200)}`);
    }

    return components;
  }

  /**
   * Generate a prompt for a detected component
   */
  async generatePrompt(
    component: DetectedComponent,
    scrapeResult: DeepScrapeResult,
  ): Promise<string> {
    this.logger.log(`Generating prompt for component: ${component.type}`);

    const userContent = JSON.stringify({
      component,
      globalCssTokens: scrapeResult.cssTokens,
      pageUrl: scrapeResult.url,
      fontsUsed: scrapeResult.fontsUsed,
    });

    const promptText = await this.perplexity.chat(
      GENERATE_SYSTEM_PROMPT,
      userContent,
      false,
    );

    this.logger.log(`Prompt generated: ${promptText.length} chars`);
    return promptText;
  }

  /**
   * Suggest media for a component
   */
  async suggestMedia(
    component: DetectedComponent,
  ): Promise<SuggestedMedia[]> {
    const keywords = this.extractKeywords(component);
    const needsVideo = component.mediaElements?.hasVideo || false;

    return this.mediaSuggester.suggestForComponent(
      component.type,
      keywords,
      needsVideo,
    );
  }

  /**
   * Extract keywords from component for media search
   */
  private extractKeywords(component: DetectedComponent): string[] {
    const keywords: string[] = [];

    // From title
    if (component.title) {
      keywords.push(...component.title.toLowerCase().split(' ').filter((w) => w.length > 3));
    }

    // From design style
    if (component.designStyle) {
      keywords.push(component.designStyle);
    }

    // From color scheme
    if (component.colorScheme) {
      keywords.push(component.colorScheme);
    }

    // From special effects
    if (component.specialEffects) {
      keywords.push(...component.specialEffects);
    }

    // Component type specific
    const typeKeywords: Record<string, string[]> = {
      hero: ['hero', 'banner', 'header'],
      navbar: ['navigation', 'menu', 'header'],
      pricing: ['pricing', 'plans', 'subscription'],
      testimonials: ['testimonials', 'reviews', 'customers'],
      features: ['features', 'benefits', 'services'],
      cta: ['call to action', 'button', 'signup'],
      footer: ['footer', 'contact', 'links'],
    };

    if (typeKeywords[component.type]) {
      keywords.push(...typeKeywords[component.type]);
    }

    return [...new Set(keywords)].slice(0, 5);
  }
}
