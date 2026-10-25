import { describe, expect, it } from 'vitest';
import { INSTALL, REPO } from '../../app/data/site';
import { llmsTxt, robotsTxt, sitemapXml } from '../../server/utils/discovery';

describe('install commands', () => {
  it.each(Object.values(INSTALL))(
    '$label: the copied line runs the same commands the page shows',
    (command) => {
      expect(command.copy).toBe(command.lines.join(' && '));
    },
  );

  it('brew taps by URL and trusts the tap (Homebrew 7 refuses untrusted taps)', () => {
    expect(INSTALL.brew.lines).toEqual([
      `brew tap vinayakkulkarni/better-helium ${REPO}`,
      'brew trust vinayakkulkarni/better-helium',
      'brew install better-helium',
    ]);
  });

  it('never installs from a raw formula URL (unsupported by Homebrew)', () => {
    for (const command of Object.values(INSTALL)) {
      expect(command.copy).not.toContain('raw.githubusercontent.com');
    }
  });
});

describe('discovery files', () => {
  it('robots.txt points at the sitemap', () => {
    expect(robotsTxt()).toContain(
      'Sitemap: https://better-helium.vinayakkulkarni.dev/sitemap.xml',
    );
  });

  it('sitemap lists the one page with the build date', () => {
    const xml = sitemapXml('2026-10-25');
    expect(xml).toContain(
      '<loc>https://better-helium.vinayakkulkarni.dev/</loc>',
    );
    expect(xml).toContain('<lastmod>2026-10-25</lastmod>');
  });

  it('llms.txt carries both install paths', () => {
    const txt = llmsTxt();
    expect(txt.startsWith('# better-helium')).toBe(true);
    expect(txt).toContain(INSTALL.brew.copy);
    expect(txt).toContain(INSTALL.git.copy);
  });
});
