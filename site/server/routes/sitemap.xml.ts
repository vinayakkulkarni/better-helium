import { sitemapXml } from '../utils/discovery';

export default defineEventHandler((event) => {
  // Content changes only on deploy, so the build date is the honest lastmod.
  const { buildDate } = useRuntimeConfig(event);
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');
  return sitemapXml(buildDate);
});
