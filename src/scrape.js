import { printSystem } from './display.js';

/**
 * Fetch a URL and extract design-relevant signals as text context.
 * Returns a string summary that gets prepended to the conversation.
 */
export async function scrapeDesignContext(url) {
  printSystem(`fetching ${url}...`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'maestro-cli/0.1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Extract design signals from HTML
  const signals = [];

  // Title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (titleMatch) signals.push(`page title: "${titleMatch[1].trim()}"`);

  // Meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);
  if (descMatch) signals.push(`meta description: "${descMatch[1].trim()}"`);

  // Fonts — google fonts, @font-face, font-family declarations
  const googleFonts = [...html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"&]+)/g)]
    .map(m => decodeURIComponent(m[1]).replace(/\+/g, ' '));
  if (googleFonts.length) signals.push(`google fonts loaded: ${googleFonts.join(', ')}`);

  const fontFamilies = [...html.matchAll(/font-family:\s*([^;}"]+)/gi)]
    .map(m => m[1].trim())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 10);
  if (fontFamilies.length) signals.push(`font-family declarations: ${fontFamilies.join(' | ')}`);

  // Colors — hex codes, rgb, hsl from inline styles and style blocks
  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => m[1]).join('\n');
  const allStyles = styleBlocks + ' ' + html;

  const hexColors = [...allStyles.matchAll(/#([0-9a-fA-F]{3,8})\b/g)]
    .map(m => '#' + m[1])
    .filter((v, i, a) => a.indexOf(v) === i && v.length <= 9)
    .slice(0, 15);
  if (hexColors.length) signals.push(`colors found: ${hexColors.join(', ')}`);

  // Background colors
  const bgColors = [...allStyles.matchAll(/background(?:-color)?:\s*([^;}"]+)/gi)]
    .map(m => m[1].trim())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);
  if (bgColors.length) signals.push(`background colors: ${bgColors.join(' | ')}`);

  // Layout signals — grid, flexbox usage
  const usesGrid = /display:\s*grid/i.test(allStyles);
  const usesFlex = /display:\s*flex/i.test(allStyles);
  if (usesGrid || usesFlex) {
    signals.push(`layout: ${[usesGrid && 'css grid', usesFlex && 'flexbox'].filter(Boolean).join(', ')}`);
  }

  // Spacing — common padding/margin values
  const spacingValues = [...allStyles.matchAll(/(?:padding|margin|gap):\s*([^;}"]+)/gi)]
    .map(m => m[1].trim())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);
  if (spacingValues.length) signals.push(`spacing values: ${spacingValues.join(' | ')}`);

  // Typography — font sizes
  const fontSizes = [...allStyles.matchAll(/font-size:\s*([^;}"]+)/gi)]
    .map(m => m[1].trim())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 10);
  if (fontSizes.length) signals.push(`font sizes: ${fontSizes.join(', ')}`);

  // Line heights
  const lineHeights = [...allStyles.matchAll(/line-height:\s*([^;}"]+)/gi)]
    .map(m => m[1].trim())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 6);
  if (lineHeights.length) signals.push(`line heights: ${lineHeights.join(', ')}`);

  // Heading structure
  const headings = [];
  for (let i = 1; i <= 3; i++) {
    const matches = [...html.matchAll(new RegExp(`<h${i}[^>]*>(.*?)<\/h${i}>`, 'gis'))];
    if (matches.length) {
      const texts = matches.slice(0, 3).map(m => m[1].replace(/<[^>]+>/g, '').trim());
      headings.push(`h${i}: ${texts.join(' | ')}`);
    }
  }
  if (headings.length) signals.push(`heading structure:\n  ${headings.join('\n  ')}`);

  // Images — count and alt text quality
  const images = [...html.matchAll(/<img[^>]*>/gi)];
  const withAlt = images.filter(m => /alt=["'][^"']+["']/i.test(m[0])).length;
  if (images.length) signals.push(`images: ${images.length} total, ${withAlt} with alt text`);

  // Frameworks / libraries
  const frameworks = [];
  if (/tailwind/i.test(html)) frameworks.push('tailwind');
  if (/bootstrap/i.test(html)) frameworks.push('bootstrap');
  if (/_next/i.test(html)) frameworks.push('next.js');
  if (/astro/i.test(html)) frameworks.push('astro');
  if (/wordpress/i.test(html)) frameworks.push('wordpress');
  if (frameworks.length) signals.push(`detected frameworks: ${frameworks.join(', ')}`);

  if (signals.length === 0) {
    signals.push('(could not extract detailed design signals from this page — the designer should describe their work verbally)');
  }

  printSystem(`extracted ${signals.length} design signals.`);

  return `the designer has submitted their website for review: ${url}\n\ndesign signals extracted from the page:\n${signals.join('\n')}\n\nuse these signals as context for your critique. ask about anything that seems unclear or contradictory. you can reference specific colors, fonts, and spacing values from the analysis.`;
}
