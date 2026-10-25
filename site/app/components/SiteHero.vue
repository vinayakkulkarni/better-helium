<script setup lang="ts">
  import { INSTALL, SITE } from '~/data/site';
</script>

<template>
  <section
    aria-labelledby="hero-title"
    class="mx-auto grid max-w-[80rem] gap-12 px-5 pt-14 pb-16 sm:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16 lg:px-12 lg:py-16"
  >
    <div class="min-w-0">
      <p class="font-mono text-xs text-ink-3">Pure bash · macOS 13+ · MIT</p>
      <h1
        id="hero-title"
        class="mt-5 font-display text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.95] font-semibold tracking-[-0.02em] text-ink"
      >
        Netflix plays in Helium again.
      </h1>
      <p class="mt-6 max-w-[38rem] text-lg leading-relaxed text-ink-2">
        <OutboundLink
          :href="SITE.helium"
          section="hero"
          class="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink-3"
          >Helium</OutboundLink
        >
        ships without Google’s Widevine library, so Netflix, Hotstar, Disney+
        and Spotify refuse to play. better-helium copies Widevine in from
        Chrome’s own installer and re-signs the app. One script. Idempotent.
        Re-run it after every Helium update.
      </p>
      <div class="mt-9 max-w-[40rem]">
        <CommandBlock :command="INSTALL.brew" section="hero" />
        <p class="mt-4 text-sm text-ink-3">
          No Homebrew?
          <a
            href="#install"
            class="text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
            >Clone it with git</a
          >. macOS asks for your password once, in its own dialog.
        </p>
      </div>
    </div>
    <GateLedger />
  </section>
</template>
