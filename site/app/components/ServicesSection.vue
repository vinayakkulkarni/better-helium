<script setup lang="ts">
  import { LIMITS, WORKS } from '~/data/site';
</script>

<template>
  <section
    id="services"
    aria-labelledby="services-title"
    class="scroll-mt-6 py-16 lg:py-24"
  >
    <SectionHead
      id="services-title"
      number="02"
      title="What plays after the patch"
    />
    <div class="mt-10 grid gap-12 lg:grid-cols-[3fr_9fr] lg:gap-16">
      <p class="text-sm text-ink-3">
        Every Chromium browser on macOS runs Widevine at L3, Chrome included.
        The caps below are the same ones Chrome has.
      </p>
      <div class="min-w-0 space-y-12">
        <table class="w-full border-collapse text-left text-sm">
          <caption class="sr-only">
            Services that play after patching
          </caption>
          <thead>
            <tr class="border-b border-ink text-ink-3">
              <th scope="col" class="py-2 pr-4 font-mono text-xs font-normal">
                Service
              </th>
              <th scope="col" class="py-2 pr-4 font-mono text-xs font-normal">
                Plays at
              </th>
              <th
                scope="col"
                class="hidden py-2 font-mono text-xs font-normal sm:table-cell"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="service in WORKS"
              :key="service.name"
              class="border-b border-rule align-top"
            >
              <th scope="row" class="py-3 pr-4 font-medium text-ink">
                <span class="mr-2 text-pass" aria-hidden="true">✓</span
                >{{ service.name }}
              </th>
              <td class="py-3 pr-4 whitespace-nowrap text-ink-2">
                {{ service.quality }}
              </td>
              <td class="hidden py-3 text-ink-3 sm:table-cell">
                {{ service.note }}
              </td>
            </tr>
          </tbody>
        </table>

        <div>
          <h3 class="text-sm font-medium text-ink">What still won’t work</h3>
          <ul class="mt-3 border-t border-rule">
            <li
              v-for="limit in LIMITS"
              :key="limit.name"
              class="grid gap-2 border-b border-rule py-4 sm:grid-cols-[14rem_1fr] sm:gap-6"
            >
              <p class="font-medium text-ink">
                <span class="mr-2 text-fail" aria-hidden="true">✕</span
                >{{ limit.name }}
                <span class="block pl-6 text-sm font-normal text-ink-3">
                  {{ limit.quality }}
                </span>
              </p>
              <p class="text-sm leading-relaxed text-ink-2">{{ limit.note }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
