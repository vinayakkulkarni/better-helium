import { SITE } from '../data/site';

/** schema.org SoftwareApplication for the one page. */
export function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    description: SITE.description,
    url: `${SITE.url}/`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'macOS 13 or later',
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: SITE.repo,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
      '@type': 'Person',
      name: SITE.maintainer.name,
      url: SITE.maintainer.url,
    },
  };
}
