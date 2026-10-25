<script setup lang="ts">
  import { SITE, STEPS } from '~/data/site';
</script>

<template>
  <section
    id="how"
    aria-labelledby="how-title"
    class="scroll-mt-6 py-16 lg:py-24"
  >
    <SectionHead id="how-title" number="03" title="How it works" />
    <div class="mt-10 grid gap-12 lg:grid-cols-[3fr_9fr] lg:gap-16">
      <div class="space-y-4 text-sm text-ink-3">
        <p>
          Widevine is closed-source and only ships inside commercial Chromium
          builds. Downloading it from Google’s own installer keeps the repo free
          of redistributed binaries.
        </p>
        <p>
          The full technical story is in
          <OutboundLink
            :href="SITE.rca"
            section="how"
            class="text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
            >RCA.md</OutboundLink
          >.
        </p>
      </div>
      <div class="min-w-0 space-y-12">
        <ol class="border-t border-rule">
          <li
            v-for="(step, i) in STEPS"
            :key="step.title"
            class="grid gap-2 border-b border-rule py-5 sm:grid-cols-[3rem_1fr] sm:gap-6"
          >
            <span class="font-mono text-sm text-ink-3">{{
              String(i + 1).padStart(2, '0')
            }}</span>
            <div class="min-w-0">
              <h3 class="font-medium text-ink">{{ step.title }}</h3>
              <p class="mt-1 max-w-[42rem] text-sm leading-relaxed text-ink-2">
                {{ step.body }}
              </p>
              <pre
                v-if="step.code"
                class="mt-3 bg-paper-2 px-3 py-2 font-mono text-xs leading-5 break-words whitespace-pre-wrap text-ink-2 [overflow-wrap:anywhere]"
              ><code>{{ step.code }}</code></pre>
            </div>
          </li>
        </ol>

        <div class="grid gap-10 md:grid-cols-2">
          <div>
            <h3 class="font-medium text-ink">Why it asks for your password</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-2">
              Moving a bundle in and out of /Applications needs administrator
              rights. The script asks macOS through AppleScript’s
              <code class="font-mono text-ink"
                >with administrator privileges</code
              >, so the password goes to Apple’s own dialog. The script never
              sees or stores it.
            </p>
          </div>
          <div>
            <h3 class="font-medium text-ink">After a Helium update</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-2">
              Updates rewrite the bundle and remove Widevine. Run
              <code class="font-mono text-ink">better-helium</code> again.
              <code class="font-mono text-ink">better-helium --check</code>
              answers in about 40 ms, fast enough for a shell prompt indicator
              that warns you when Helium is unpatched.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
