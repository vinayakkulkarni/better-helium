/**
 * The site is one page. Without a router, Nuxt would render that page for
 * every path with a 200; answer unknown paths with a real 404 instead.
 * Static files never reach the Worker (Cloudflare serves them from assets).
 */
const ROUTES = new Set(['/', '/robots.txt', '/sitemap.xml', '/llms.txt']);

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event);
  if (ROUTES.has(pathname) || pathname.startsWith('/_nuxt/')) return;
  // Nuxt's own internal endpoints (error page payloads, island renders).
  if (pathname.startsWith('/__nuxt')) return;
  throw createError({ statusCode: 404, statusMessage: 'Not Found' });
});
