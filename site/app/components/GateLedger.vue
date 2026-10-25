<script setup lang="ts">
  import { GATES, SITE, type GateState } from '~/data/site';

  const MARK: Record<GateState, string> = {
    pass: 'Passes',
    fail: 'Fails',
    na: 'Not applicable',
  };
</script>

<template>
  <section aria-labelledby="gates-title" class="border border-rule">
    <header
      class="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-3"
    >
      <h2 id="gates-title" class="font-mono text-xs text-ink-3">
        DRM gates on macOS
      </h2>
      <OutboundLink
        :href="SITE.rca"
        section="hero"
        class="font-mono text-xs text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
      >
        RCA.md
      </OutboundLink>
    </header>
    <div
      class="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-rule px-5 py-2 font-mono text-[0.6875rem] tracking-wide text-ink-3 uppercase sm:gap-x-8"
      aria-hidden="true"
    >
      <span>Gate</span>
      <span class="w-14 text-center">Stock</span>
      <span class="w-14 text-center">Patched</span>
    </div>
    <ol>
      <li
        v-for="gate in GATES"
        :key="gate.name"
        class="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-rule px-5 py-4 last:border-b-0 sm:gap-x-8"
      >
        <div class="min-w-0">
          <p class="text-[0.9375rem] font-medium text-ink">{{ gate.name }}</p>
          <p class="mt-0.5 text-sm text-ink-3">{{ gate.after.text }}</p>
        </div>
        <span
          v-for="side in [gate.before, gate.after]"
          :key="side === gate.before ? 'before' : 'after'"
          class="flex w-14 justify-center"
        >
          <span
            class="font-display text-[2rem] leading-none"
            :class="{
              'text-pass': side.state === 'pass',
              'text-fail': side.state === 'fail',
              'text-ink-3': side.state === 'na',
            }"
            :title="`${side === gate.before ? 'Stock Helium' : 'After better-helium'}: ${side.text}`"
          >
            <span aria-hidden="true">{{
              side.state === 'pass' ? '✓' : side.state === 'fail' ? '✕' : '–'
            }}</span>
            <span class="sr-only">
              {{
                side === gate.before ? 'Stock Helium' : 'After better-helium'
              }}: {{ MARK[side.state] }}, {{ side.text }}
            </span>
          </span>
        </span>
      </li>
    </ol>
  </section>
</template>
