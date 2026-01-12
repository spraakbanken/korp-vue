<script setup lang="ts">
import type { Token } from "@/core/backend/types"

defineProps<{
  token: Token
}>()
</script>

<template>
  <span
    class="kwic-token text-nowrap rounded-3"
    :class="{ 'fw-bold': token._match, 'kwic-token-punct': token._punct }"
  >
    {{ token.word }}
  </span>
</template>

<style lang="scss">
.kwic-token {
  margin-inline: 0.15em;
  cursor: pointer;
  transition: background-color 100ms ease-in-out;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
  }
}
.kwic-token-punct {
  margin-inline-start: -0.15em;
}
</style>
