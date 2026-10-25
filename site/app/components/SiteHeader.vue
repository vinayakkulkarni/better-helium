<script setup lang="ts">
  import { SITE } from '~/data/site';

  const NAV = [
    { href: '#install', label: 'Install' },
    { href: '#services', label: 'Services' },
    { href: '#how', label: 'How it works' },
  ];
</script>

<template>
  <header class="border-b border-rule">
    <div
      class="mx-auto flex h-16 max-w-[80rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
    >
      <a
        href="#top"
        class="flex items-center gap-2.5 font-mono text-sm text-ink"
        aria-label="better-helium, back to top"
      >
        <svg class="size-5" viewBox="0 0 32 32" aria-hidden="true">
          <path
            d="M16 3 L27 7.5 V15.5 C27 22 22.4 26.9 16 29 C9.6 26.9 5 22 5 15.5 V7.5 Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linejoin="round"
          />
          <path
            d="M11 16 L14.5 19.5 L21 12.5"
            fill="none"
            class="stroke-pass"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        better-helium
      </a>
      <nav aria-label="Sections" class="flex items-center gap-1 sm:gap-2">
        <a
          v-for="item in NAV"
          :key="item.href"
          :href="item.href"
          class="hidden px-2 py-1 text-sm text-ink-2 transition-colors hover:text-ink md:inline"
        >
          {{ item.label }}
        </a>
        <OutboundLink
          :href="SITE.repo"
          section="header"
          class="inline-flex h-9 items-center gap-2 border border-rule px-3 font-mono text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
            />
          </svg>
          <span>GitHub</span>
        </OutboundLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>
