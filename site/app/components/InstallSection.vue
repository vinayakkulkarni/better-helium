<script setup lang="ts">
  import { FLAGS, INSTALL, REQUIREMENTS } from '~/data/site';
</script>

<template>
  <section
    id="install"
    aria-labelledby="install-title"
    class="scroll-mt-6 py-16 lg:py-24"
  >
    <SectionHead id="install-title" number="01" title="Install and run" />
    <div class="mt-10 grid gap-12 lg:grid-cols-[3fr_9fr] lg:gap-16">
      <div>
        <h3 class="text-sm font-medium text-ink">Requirements</h3>
        <ul class="mt-3 space-y-2 text-sm text-ink-2">
          <li v-for="req in REQUIREMENTS" :key="req">{{ req }}</li>
        </ul>
        <p class="mt-4 text-sm text-ink-3">
          You do not need Google Chrome installed.
        </p>
      </div>
      <div class="min-w-0 space-y-10">
        <div class="max-w-[42rem] space-y-8">
          <div class="min-w-0">
            <CommandBlock :command="INSTALL.brew" section="install" />
            <p class="mt-3 text-sm text-ink-3">
              Homebrew 7 asks you to trust a third-party tap before it installs
              from it; <code class="font-mono text-ink-2">brew trust</code> is
              that step. Upgrade later with
              <code class="font-mono text-ink-2"
                >brew upgrade better-helium</code
              >.
            </p>
          </div>
          <div class="min-w-0">
            <CommandBlock :command="INSTALL.git" section="install" />
            <p class="mt-3 text-sm text-ink-3">
              The script is self-contained. Run it from the clone, or put it
              anywhere on your <code class="font-mono text-ink-2">PATH</code>.
            </p>
          </div>
        </div>
        <p class="max-w-[42rem] text-ink-2">
          The first patch downloads Google’s Chrome.dmg (~250 MB) and caches the
          Widevine library. Later patches reuse the cache and take about 30
          seconds.
        </p>
        <div>
          <h3 class="text-sm font-medium text-ink">Usage</h3>
          <dl class="mt-3 border-t border-rule">
            <div
              v-for="item in FLAGS"
              :key="item.flag"
              class="grid gap-1 border-b border-rule py-3 sm:grid-cols-[10rem_1fr] sm:gap-6"
            >
              <dt class="font-mono text-sm text-ink">{{ item.flag }}</dt>
              <dd class="text-sm text-ink-2">{{ item.does }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>
