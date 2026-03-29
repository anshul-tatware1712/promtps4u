import { Injectable, Logger } from '@nestjs/common';

export interface StyleSnapshot {
  selector: string;
  elementType: string;
  role?: string;
  ariaLabel?: string;
  textContent?: string;
  boundingBox: DOMRect;
  computedStyles: Record<string, string>;
  tailwindClasses: string[];
  children?: StyleSnapshot[];
}

@Injectable()
export class StyleSnapshotterService {
  private readonly logger = new Logger(StyleSnapshotterService.name);

  /**
   * Capture computed style snapshots of top-level sections and their children
   */
  async captureSnapshots(page: any): Promise<StyleSnapshot[]> {
    try {
      return await page.evaluate(() => {
        const IMPORTANT_PROPERTIES = [
          // Layout
          'display', 'position', 'top', 'right', 'bottom', 'left',
          'flex', 'flexDirection', 'flexWrap', 'flexGrow', 'flexShrink', 'flexBasis',
          'justifyContent', 'alignItems', 'alignContent', 'alignSelf',
          'grid', 'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow',
          'gap', 'columnGap', 'rowGap',

          // Sizing
          'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
          'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
          'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
          'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',

          // Visual
          'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
          'border', 'borderColor', 'borderStyle', 'borderRadius',
          'boxShadow', 'outline', 'outlineColor', 'outlineWidth', 'outlineOffset',
          'opacity', 'filter', 'backdropFilter',

          // Transform & animation
          'transform', 'transformOrigin', 'transition', 'animation',

          // Typography
          'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
          'color', 'textDecoration', 'textDecorationColor', 'textTransform', 'letterSpacing', 'lineHeight',
          'textAlign', 'textOverflow', 'whiteSpace', 'wordBreak',

          // Other
          'overflow', 'overflowX', 'overflowY',
          'zIndex', 'clipPath', 'mask', 'objectFit', 'cursor',
          'visibility', 'pointerEvents'
        ];

        function getSelector(el: Element): string {
          if (el.id) return `#${el.id}`;
          if (el.className && typeof el.className === 'string') {
            const classes = el.className.split(' ').filter(c => c && !c.startsWith('css-')).slice(0, 2);
            if (classes.length) return `${el.tagName.toLowerCase()}.${classes.join('.')}`;
          }
          return el.tagName.toLowerCase();
        }

        function cssToTailwind(value: string, property: string): string[] {
          const classes: string[] = [];

          // Display
          if (property === 'display') {
            if (value === 'flex') classes.push('flex');
            if (value === 'grid') classes.push('grid');
            if (value === 'none') classes.push('hidden');
            if (value === 'block') classes.push('block');
            if (value === 'inline-block') classes.push('inline-block');
          }

          // Flex direction
          if (property === 'flexDirection') {
            if (value === 'column') classes.push('flex-col');
            if (value === 'row-reverse') classes.push('flex-row-reverse');
            if (value === 'column-reverse') classes.push('flex-col-reverse');
          }

          // Justify content
          if (property === 'justifyContent') {
            const map: Record<string, string> = {
              'flex-start': 'justify-start',
              'flex-end': 'justify-end',
              'center': 'justify-center',
              'space-between': 'justify-between',
              'space-around': 'justify-around',
              'space-evenly': 'justify-evenly'
            };
            if (map[value]) classes.push(map[value]);
          }

          // Align items
          if (property === 'alignItems') {
            const map: Record<string, string> = {
              'flex-start': 'items-start',
              'flex-end': 'items-end',
              'center': 'items-center',
              'baseline': 'items-baseline',
              'stretch': 'items-stretch'
            };
            if (map[value]) classes.push(map[value]);
          }

          // Font size (approximate)
          if (property === 'fontSize') {
            const px = parseFloat(value);
            if (px <= 12) classes.push('text-xs');
            else if (px <= 14) classes.push('text-sm');
            else if (px <= 16) classes.push('text-base');
            else if (px <= 18) classes.push('text-lg');
            else if (px <= 20) classes.push('text-xl');
            else if (px <= 24) classes.push('text-2xl');
            else if (px <= 30) classes.push('text-3xl');
            else if (px <= 36) classes.push('text-4xl');
            else if (px <= 48) classes.push('text-5xl');
            else if (px <= 60) classes.push('text-6xl');
            else if (px <= 72) classes.push('text-7xl');
            else classes.push('text-8xl');
          }

          // Font weight
          if (property === 'fontWeight') {
            const w = parseInt(value);
            if (w <= 200) classes.push('font-thin');
            else if (w <= 300) classes.push('font-light');
            else if (w <= 400) classes.push('font-normal');
            else if (w <= 500) classes.push('font-medium');
            else if (w <= 600) classes.push('font-semibold');
            else if (w <= 700) classes.push('font-bold');
            else if (w <= 800) classes.push('font-extrabold');
            else classes.push('font-black');
          }

          // Border radius
          if (property === 'borderRadius' || property.endsWith('Radius')) {
            const px = parseFloat(value);
            if (px <= 2) classes.push('rounded-sm');
            else if (px <= 4) classes.push('rounded');
            else if (px <= 8) classes.push('rounded-md');
            else if (px <= 12) classes.push('rounded-lg');
            else if (px <= 16) classes.push('rounded-xl');
            else if (px <= 24) classes.push('rounded-2xl');
            else if (px <= 32) classes.push('rounded-3xl');
            else classes.push('rounded-full');
          }

          // Box shadow (simplified)
          if (property === 'boxShadow' && value !== 'none' && value) {
            if (value.includes('inset')) classes.push('shadow-inner');
            else if (value.includes('0px 0px')) classes.push('shadow-sm');
            else if (value.includes('0px 1px 2px')) classes.push('shadow');
            else if (value.includes('0px 4px 6px')) classes.push('shadow-md');
            else if (value.includes('0px 10px 15px')) classes.push('shadow-lg');
            else if (value.includes('0px 20px 25px')) classes.push('shadow-xl');
            else if (value.includes('0px 25px 50px')) classes.push('shadow-2xl');
            else classes.push('shadow');
          }

          // Letter spacing (approximate)
          if (property === 'letterSpacing') {
            const em = parseFloat(value);
            if (em <= -0.05) classes.push('tracking-tighter');
            else if (em <= -0.025) classes.push('tracking-tight');
            else if (em <= 0.025) classes.push('tracking-normal');
            else if (em <= 0.05) classes.push('tracking-wide');
            else if (em <= 0.1) classes.push('tracking-wider');
            else classes.push('tracking-widest');
          }

          // Line height
          if (property === 'lineHeight') {
            const baseFontSize = parseFloat(window.getComputedStyle(document.body).fontSize) || 16;
            const unitless = parseFloat(value) / baseFontSize;
            if (unitless <= 1) classes.push('leading-none');
            else if (unitless <= 1.25) classes.push('leading-tight');
            else if (unitless <= 1.375) classes.push('leading-snug');
            else if (unitless <= 1.5) classes.push('leading-normal');
            else if (unitless <= 1.625) classes.push('leading-relaxed');
            else classes.push('leading-loose');
          }

          // Opacity
          if (property === 'opacity') {
            const pct = Math.round(parseFloat(value) * 100);
            if (pct <= 5) classes.push('opacity-0');
            else if (pct <= 10) classes.push('opacity-10');
            else if (pct <= 20) classes.push('opacity-20');
            else if (pct <= 30) classes.push('opacity-30');
            else if (pct <= 40) classes.push('opacity-40');
            else if (pct <= 50) classes.push('opacity-50');
            else if (pct <= 60) classes.push('opacity-60');
            else if (pct <= 70) classes.push('opacity-70');
            else if (pct <= 80) classes.push('opacity-80');
            else if (pct <= 90) classes.push('opacity-90');
            else classes.push('opacity-100');
          }

          // Z-index
          if (property === 'zIndex' && value !== 'auto') {
            classes.push(`z-[${value}]`);
          }

          // Cursor
          if (property === 'cursor') {
            if (value === 'pointer') classes.push('cursor-pointer');
            if (value === 'not-allowed') classes.push('cursor-not-allowed');
            if (value === 'text') classes.push('cursor-text');
            if (value === 'move') classes.push('cursor-move');
            if (value === 'grab') classes.push('cursor-grab');
            if (value === 'grabbing') classes.push('cursor-grabbing');
            if (value === 'default') classes.push('cursor-default');
          }

          // Object fit
          if (property === 'objectFit') {
            if (value === 'cover') classes.push('object-cover');
            if (value === 'contain') classes.push('object-contain');
            if (value === 'fill') classes.push('object-fill');
            if (value === 'none') classes.push('object-none');
            if (value === 'scale-down') classes.push('object-scale-down');
          }

          // Overflow
          if (property === 'overflow') {
            if (value === 'hidden') classes.push('overflow-hidden');
            if (value === 'auto') classes.push('overflow-auto');
            if (value === 'scroll') classes.push('overflow-scroll');
            if (value === 'visible') classes.push('overflow-visible');
          }

          // Position
          if (property === 'position') {
            if (value === 'relative') classes.push('relative');
            if (value === 'absolute') classes.push('absolute');
            if (value === 'fixed') classes.push('fixed');
            if (value === 'sticky') classes.push('sticky');
          }

          return classes;
        }

        function snapshotElement(el: Element): StyleSnapshot | null {
          const computed = window.getComputedStyle(el);
          let rect: DOMRect;
          try {
            rect = el.getBoundingClientRect();
          } catch {
            return null;
          }

          // Skip hidden or tiny elements
          if (rect.width < 5 || rect.height < 5) return null;
          if (computed.display === 'none' || computed.visibility === 'hidden') return null;

          const computedStyles: Record<string, string> = {};
          const tailwindClasses: string[] = [];

          IMPORTANT_PROPERTIES.forEach(prop => {
            const value = computed[prop as keyof CSSStyleDeclaration] as string;
            if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
              computedStyles[prop] = value;
              const twClasses = cssToTailwind(value, prop);
              tailwindClasses.push(...twClasses);
            }
          });

          // Get existing classes from element
          const existingClasses = Array.from(el.classList).filter(c => !c.startsWith('css-'));

          return {
            selector: getSelector(el),
            elementType: el.tagName,
            role: el.getAttribute('role') || undefined,
            ariaLabel: el.getAttribute('aria-label') || undefined,
            textContent: el.textContent?.trim().slice(0, 50) || undefined,
            boundingBox: rect.toJSON() as DOMRect,
            computedStyles,
            tailwindClasses: [...new Set([...existingClasses, ...tailwindClasses])],
            children: undefined
          };
        }

        // Capture top-level sections and their children
        const snapshots: StyleSnapshot[] = [];
        const topLevelSelectors = [
          'header', 'nav', 'main', 'section', 'footer',
          '[role="main"]', '[role="region"]', '[role="navigation"]',
          '.hero', '.navbar', '.header', '.footer', '.section',
          '[class*="hero"]', '[class*="nav"]', '[class*="header"]',
          'article', 'aside', '[class*="container"]',
          '[class*="wrapper"]', '[class*="content"]'
        ];

        const topLevelElements = document.querySelectorAll(topLevelSelectors.join(', '));

        topLevelElements.forEach((el) => {
          const snapshot = snapshotElement(el);
          if (snapshot) {
            // Capture direct children
            const children = Array.from(el.children)
              .map(child => snapshotElement(child))
              .filter(Boolean) as StyleSnapshot[];

            if (children.length > 0) {
              snapshot.children = children.slice(0, 10); // Limit children
            }
            snapshots.push(snapshot);
          }
        });

        return snapshots.slice(0, 20); // Limit top-level sections
      });
    } catch (error) {
      this.logger.error(`Failed to capture style snapshots: ${error.message}`);
      return [];
    }
  }
}
