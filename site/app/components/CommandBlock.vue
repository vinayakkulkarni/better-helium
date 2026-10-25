<script setup lang="ts">
  import type { InstallCommand } from '~/data/site';
  import type { PageSection } from '~/types/analytics';

  const props = defineProps<{
    command: InstallCommand;
    section: PageSection;
  }>();

  const { track } = useAnalytics();
  const status = ref<'idle' | 'copied' | 'failed'>('idle');
  let reset: ReturnType<typeof setTimeout> | undefined;

  async function copy() {
    try {
      await navigator.clipboard.writeText(props.command.copy);
      status.value = 'copied';
      track('install_copy', {
        method: props.command.method,
        section: props.section,
      });
    } catch {
      status.value = 'failed';
    }
    clearTimeout(reset);
    reset = setTimeout(() => (status.value = 'idle'), 2000);
  }

  onBeforeUnmount(() => clearTimeout(reset));

  const buttonLabel = computed(() =>
    status.value === 'copied'
      ? 'Copied'
      : status.value === 'failed'
        ? 'Select and copy'
        : 'Copy',
  );
</script>

<template>
  <figure class="border border-term bg-term text-term-ink">
    <figcaption
      class="flex items-center justify-between gap-3 border-b border-term-dim/25 py-2 pr-2 pl-4"
    >
      <span class="font-mono text-xs text-term-dim">
        {{ props.command.label }}
      </span>
      <button
        type="button"
        class="inline-flex h-8 min-w-[5.5rem] items-center justify-center gap-2 border border-term-dim/40 px-3 font-mono text-xs text-term-ink transition-colors hover:border-term-ink"
        :aria-label="`Copy the ${props.command.label} install command`"
        @click="copy"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path v-if="status === 'copied'" d="M5 12.5l4.5 4.5L19 7.5" />
          <template v-else>
            <rect x="8" y="8" width="12" height="12" rx="1" />
            <path
              d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
            />
          </template>
        </svg>
        <span>{{ buttonLabel }}</span>
      </button>
    </figcaption>
    <pre
      class="px-4 py-4 font-mono text-xs leading-6 whitespace-pre-wrap [overflow-wrap:break-word] sm:text-[0.8125rem]"
    ><code><span
      v-for="(line, i) in props.command.lines"
      :key="i"
      class="block pl-[2ch] -indent-[2ch]"
    ><span class="select-none text-term-dim" aria-hidden="true">$ </span>{{ line }}</span></code></pre>
    <p class="sr-only" aria-live="polite">
      {{ status === 'copied' ? 'Command copied to the clipboard' : '' }}
    </p>
  </figure>
</template>
