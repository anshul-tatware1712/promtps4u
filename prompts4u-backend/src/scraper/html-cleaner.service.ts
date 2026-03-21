import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface CssTokens {
  colors: string[];
  fonts: string[];
  spacing: string[];
  borderRadii: string[];
  shadows: string[];
  gradients: string[];
  transitions: string[];
}

export interface CleanHtmlResult {
  cleanedHtml: string;
  cssTokens: CssTokens;
  fontsUsed: string[];
  colorPalette: string[];
}

@Injectable()
export class HtmlCleanerService {
  private readonly logger = new Logger(HtmlCleanerService.name);

  /**
   * Deep clean HTML and extract design tokens
   */
  deepClean(rawHtml: string): CleanHtmlResult {
    const cssTokens = this.extractCssTokensBeforeCleaning(rawHtml);
    const $ = cheerio.load(rawHtml);

    // 1. Remove non-structural elements
    $('script, noscript, iframe, canvas, link[rel="stylesheet"]').remove();

    // 2. KEEP <style> tags — extract before removing
    const styleContent: string[] = [];
    $('style').each((_, el) => {
      styleContent.push($(el).text());
    });
    $('style').remove();

    // 3. Strip framework noise attributes but KEEP class and data-state
    const removeAttrs = [
      'onclick',
      'onmouseenter',
      'onmouseleave',
      'onload',
      'data-v-',
      'data-react',
      '__ng',
      'wire:',
      'x-data',
      'x-bind',
      '_ngcontent',
      '_nghost',
      'data-turbo',
      'data-controller',
    ];

    $('*').each((_, el) => {
      const attrs = Object.keys((el as any).attribs || {});
      attrs.forEach((attr) => {
        if (removeAttrs.some((n) => attr.startsWith(n))) {
          $(el).removeAttr(attr);
        }
      });
    });

    // 4. Inline styles → extract values then remove style attr
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      // Extract any hardcoded colors from inline styles
      const colors =
        style.match(/#[0-9a-f]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\)/gi) || [];
      cssTokens.colors.push(...colors);
      $(el).removeAttr('style');
    });

    // 5. Truncate long text nodes (AI doesn't need full copy)
    $('*')
      .contents()
      .filter((_, n) => (n as any).type === 'text')
      .each((_, n) => {
        const t = (n as any).data?.trim();
        if (t && t.length > 150) (n as any).data = t.slice(0, 150) + '…';
      });

    // 6. Remove empty divs with no class/id (layout noise)
    $('div, span').each((_, el) => {
      const $el = $(el);
      if (
        !$(el).attr('class') &&
        !$(el).attr('id') &&
        $el.children().length === 0 &&
        !$el.text().trim()
      ) {
        $el.remove();
      }
    });

    // 7. Add data-section attribute to top-level sections for AI orientation
    let sectionIndex = 0;
    $('body > *, main > *, [role="main"] > *').each((_, el) => {
      $(el).attr('data-section-index', String(sectionIndex++));
    });

    const cleanedHtml = $.html();
    const fontsUsed = this.extractFontsFromStyles(styleContent.join('\n'));
    const colorPalette = [...new Set(cssTokens.colors)].slice(0, 30);

    this.logger.log(
      `HTML cleaned: ${cleanedHtml.length} chars, ${fontsUsed.length} fonts, ${colorPalette.length} colors`,
    );

    return { cleanedHtml, cssTokens, fontsUsed, colorPalette };
  }

  /**
   * Extract CSS tokens before cleaning
   */
  private extractCssTokensBeforeCleaning(rawHtml: string): CssTokens {
    const tokens: CssTokens = {
      colors: [],
      fonts: [],
      spacing: [],
      borderRadii: [],
      shadows: [],
      gradients: [],
      transitions: [],
    };

    // Colors (CSS vars + hex + rgb + hsl)
    const colorRegex =
      /(?:--[\w-]+:\s*)?(?:#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\))/g;
    tokens.colors = [...new Set((rawHtml.match(colorRegex) || []).slice(0, 40))];

    // CSS variables (huge signal for design system)
    const cssVarRegex = /--([\w-]+):\s*([^;}\n]+)/g;
    let match;
    while ((match = cssVarRegex.exec(rawHtml)) !== null) {
      const [, name, value] = match;
      if (name.includes('color') || name.includes('bg') || name.includes('fore')) {
        tokens.colors.push(`--${name}: ${value.trim()}`);
      }
      if (name.includes('radius') || name.includes('rounded')) {
        tokens.borderRadii.push(`--${name}: ${value.trim()}`);
      }
      if (name.includes('shadow')) {
        tokens.shadows.push(`--${name}: ${value.trim()}`);
      }
      if (name.includes('font') || name.includes('text')) {
        tokens.fonts.push(`--${name}: ${value.trim()}`);
      }
    }

    // Google Fonts URLs
    const fontUrlRegex = /fonts\.googleapis\.com\/css[^"']+/g;
    const fontUrls = rawHtml.match(fontUrlRegex) || [];
    fontUrls.forEach((url) => {
      const families = url.match(/family=([^&]+)/)?.[1]?.replace(/\+/g, ' ');
      if (families) tokens.fonts.push(families);
    });

    // Gradients
    tokens.gradients = (rawHtml.match(/(?:linear|radial|conic)-gradient\([^)]+\)/g) || []).slice(0, 10);

    // Border radii
    tokens.borderRadii.push(...(rawHtml.match(/border-radius:\s*[^;]+/g) || []).slice(0, 10));

    // Box shadows
    tokens.shadows.push(...(rawHtml.match(/box-shadow:\s*[^;]+/g) || []).slice(0, 10));

    // Transitions
    tokens.transitions = (rawHtml.match(/transition:\s*[^;]+/g) || []).slice(0, 10);

    return tokens;
  }

  /**
   * Extract fonts from CSS styles
   */
  private extractFontsFromStyles(css: string): string[] {
    const fonts: string[] = [];
    const fontFamilyRegex = /font-family:\s*['"]?([^'",}]+)/g;
    let m;
    while ((m = fontFamilyRegex.exec(css)) !== null) {
      fonts.push(m[1].trim().replace(/['"]/g, ''));
    }
    return [...new Set(fonts)].slice(0, 10);
  }
}
