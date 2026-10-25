<script setup lang="ts">
  const props = defineProps<{
    id: string;
    number: string;
    title: string;
  }>();
</script>

<template>
  <div
    class="grid gap-3 border-t border-ink pt-5 lg:grid-cols-[3fr_9fr] lg:gap-16"
  >
    <p class="font-mono text-xs text-ink-3">{{ props.number }}</p>
    <h2
      :id="props.id"
      class="font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.01em] text-ink"
    >
      {{ props.title }}
    </h2>
  </div>
</template>
