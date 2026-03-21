/**
 * Scraper module types
 */

export interface ScrapeJob {
  pageId: string;
  url: string;
  priority?: 'high' | 'normal';
}

export interface InteractionState {
  stateName: string; // 'hover' | 'open' | 'closed' | 'active' | 'focus'
  selector: string; // CSS selector of the element
  htmlSnapshot: string; // HTML at this state
  cssChanges: string[]; // which CSS properties changed
}

export interface AnimationInfo {
  selector: string;
  animationName: string;
  duration: string;
  easing: string;
  delay: string;
  keyframes?: string;
}

export interface SvgElement {
  selector: string;
  markup: string;
  purpose: string; // AI will fill this: 'logo' | 'icon' | 'decoration'
  isAnimated: boolean;
}

export interface CssTokens {
  colors: string[];
  fonts: string[];
  spacing: string[];
  borderRadii: string[];
  shadows: string[];
  gradients: string[];
  transitions: string[];
}

export interface DeepScrapeResult {
  url: string;
  title: string;
  html: string; // full rendered HTML
  cleanedHtml: string; // after Cheerio pipeline
  screenshotBuffer: Buffer;
  cssTokens: CssTokens;
  interactionStates: InteractionState[];
  animations: AnimationInfo[];
  svgElements: SvgElement[];
  responsiveHtml: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  fontsUsed: string[];
  colorPalette: string[];
  scrollDepth: number;
}
