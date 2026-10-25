import { INSTALL, SITE, STEPS, WORKS } from '../../app/data/site';

export function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join('\n');
}

export function sitemapXml(lastmod: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${SITE.url}/</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '  </url>',
    '</urlset>',
    '',
  ].join('\n');
}

/** llms.txt (llmstxt.org): H1, blockquote summary, then sections. */
export function llmsTxt(): string {
  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    '## Install',
    '',
    `- Homebrew: \`${INSTALL.brew.copy}\``,
    `- Git: \`${INSTALL.git.copy}\``,
    '',
    '## Plays after patching',
    '',
    ...WORKS.map((s) => `- ${s.name}: ${s.quality}`),
    '- Amazon Prime Video stays SD (needs VMP signing only Google can grant)',
    '',
    '## How it works',
    '',
    ...STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`),
    '',
    '## Links',
    '',
    `- [Source](${SITE.repo})`,
    `- [Root-cause analysis](${SITE.rca})`,
    '',
  ].join('\n');
}
