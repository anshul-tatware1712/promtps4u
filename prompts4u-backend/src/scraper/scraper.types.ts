/**
 * Scraper module types
 */

export interface ScrapeJob {
  pageId: string;
  url: string;
  priority?: 'high' | 'normal';
}

export interface InteractionState {
  stateName: string; // 'hover' | 'focus' | 'focus-visible' | 'active'
  selector: string; // CSS selector of the element
  tagName: string;
  id?: string;
  className?: string;
  role?: string;
  ariaLabel?: string;
  textContent?: string;
  styleChanges?: Record<string, { from: string; to: string }>;
  classChanges?: string[];
  tailwindHints?: string[];
}

export interface AnimationInfo {
  type: 'keyframes' | 'transition' | 'inline' | 'transform';
  selector: string;
  animationName?: string;
  duration?: string;
  timingFunction?: string;
  delay?: string;
  iterationCount?: string;
  direction?: string;
  fillMode?: string;
  keyframeRules?: string;
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
  inlineStyle?: string;
  computedAnimation?: {
    name: string;
    duration: string;
    timingFunction: string;
    delay: string;
  };
  transform?: string;
  transformOrigin?: string;
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

export interface StyleSnapshot {
  selector: string;
  elementType: string;
  role?: string;
  ariaLabel?: string;
  textContent?: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  computedStyles: Record<string, string>;
  tailwindClasses: string[];
  children?: StyleSnapshot[];
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
  styleSnapshots: StyleSnapshot[]; // NEW - Phase 2
  responsiveHtml: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  fontsUsed: string[];
  colorPalette: string[];
  scrollDepth: number;
}
