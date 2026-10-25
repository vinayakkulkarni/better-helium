<script setup lang="ts">
  import { SITE } from '~/data/site';
  import { structuredData } from '~/utils/structured-data';

  useSeoMeta({
    title: SITE.title,
    description: SITE.description,
    ogType: 'website',
    ogSiteName: SITE.name,
    ogUrl: `${SITE.url}/`,
    ogTitle: SITE.title,
    ogDescription: SITE.description,
    twitterCard: 'summary',
    twitterTitle: SITE.title,
    twitterDescription: SITE.description,
  });

  useHead({
    link: [{ rel: 'canonical', href: `${SITE.url}/` }],
    meta: [
      {
        name: 'theme-color',
        content: '#f6f8fa',
        media: '(prefers-color-scheme: light)',
      },
      {
        name: 'theme-color',
        content: '#111419',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(structuredData()),
      },
    ],
  });
</script>

<template>
  <div id="top">
    <a
      href="#install"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
    >
      Skip to install
    </a>
    <SiteHeader />
    <main>
      <SiteHero />
      <div class="mx-auto max-w-[80rem] px-5 sm:px-8 lg:px-12">
        <InstallSection />
        <ServicesSection />
        <HowSection />
      </div>
    </main>
    <div class="mx-auto max-w-[80rem] px-5 sm:px-8 lg:px-12">
      <SiteFooter />
    </div>
  </div>
</template>
