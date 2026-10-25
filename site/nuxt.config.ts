import tailwindcss from '@tailwindcss/vite';

// Cloudflare compatibility date — keep the two copies below in sync.
const COMPATIBILITY_DATE = '2026-10-22';

// GA4 measurement ID. Empty until the property exists: the GA4 plugin skips
// itself when this is empty. Override per env with NUXT_PUBLIC_GTAG_ID.
const GTAG_ID = 'G-7S2898BMK0';

export default defineNuxtConfig({
  compatibilityDate: COMPATIBILITY_DATE,

  modules: ['@nuxtjs/color-mode', '@nuxt/scripts', '@openpanel/nuxt'],

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Cookie-backed so the server renders the right class on <html>; the
  // module's inline head script resolves "system" before first paint.
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storage: 'cookie',
    storageKey: 'better-helium-color-mode',
  },

  // Public IDs ship in the HTML; they are not secrets.
  runtimeConfig: {
    buildDate: new Date().toISOString().slice(0, 10),
    public: {
      gtagId: GTAG_ID,
      plausibleScriptId: 'Rhx1cA4MsdnbNIrJlcuyC',
      plausibleApiHost: 'https://analytics.geoql.in',
    },
  },

  openpanel: {
    clientId: 'c266b8e1-0ca7-4256-9abf-3d60d3601feb',
    apiUrl: 'https://events.geoql.in/api',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
    proxy: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          href: '/fonts/clash-display-600.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        {
          rel: 'preload',
          href: '/fonts/satoshi-400.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
    },
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
      // Merged into the generated .output/server/wrangler.json.
      wrangler: {
        name: 'better-helium-site',
        account_id: 'bd11b1c42ee2759044a1769f80f704dd',
        compatibility_date: COMPATIBILITY_DATE,
        workers_dev: true,
        preview_urls: false,
        routes: [
          { pattern: 'better-helium.vinayakkulkarni.dev', custom_domain: true },
        ],
        observability: { enabled: true },
      },
    },
  },

  typescript: {
    strict: true,
  },
});
