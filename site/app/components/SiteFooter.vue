<script setup lang="ts">
  import { SITE } from '~/data/site';

  const LINKS = [
    { href: SITE.repo, label: 'Source on GitHub' },
    { href: SITE.rca, label: 'RCA.md' },
    { href: SITE.readme, label: 'README' },
    { href: SITE.license, label: 'MIT license' },
  ];
</script>

<template>
  <footer class="border-t border-ink py-12">
    <div
      class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
    >
      <div class="max-w-[30rem]">
        <p class="font-mono text-sm text-ink">better-helium</p>
        <p class="mt-2 text-sm text-ink-3">
          Not affiliated with imput.net, Helium or Google. Widevine is a
          trademark of Google.
        </p>
      </div>
      <ul class="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <li v-for="link in LINKS" :key="link.href">
          <OutboundLink
            :href="link.href"
            section="footer"
            class="text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
          >
            {{ link.label }}
          </OutboundLink>
        </li>
      </ul>
    </div>
    <p class="mt-10 text-sm text-ink-3">
      Made by
      <OutboundLink
        :href="SITE.maintainer.url"
        section="footer"
        class="text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
        >{{ SITE.maintainer.name }}</OutboundLink
      >.
    </p>
  </footer>
</template>
