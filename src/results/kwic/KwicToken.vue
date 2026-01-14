<script setup lang="ts">
import type { ApiKwic, Token } from "@/core/backend/types"
import { injectionKeys } from "@/injection"
import { computed, inject, useId } from "vue"

defineProps<{
  row: ApiKwic
  token: Token
}>()

/** Unique identifier for this component instance. Used for tracking selected token. */
const id = useId()

const selectedToken = inject(injectionKeys.selectedToken)
const isSelected = computed(() => selectedToken?.value?.id == id)
</script>

<template>
  <span
    class="d-inline-block kwic-token rounded-3"
    :class="{
      'fw-bold': token._match,
      'kwic-token-punct': token._punct,
      'kwic-token-selected': isSelected,
    }"
    @click.stop="selectedToken = { id, token, row }"
  >
    {{ token.word }}
  </span>
</template>

<style lang="scss">
.kwic-token {
  margin-inline: 0.15em;
  cursor: pointer;
  transition: 100ms ease-in-out;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
  }
}

.kwic-token-punct {
  margin-inline-start: -0.15em;
}

.kwic-token-selected {
  background-color: var(--bs-success-bg-subtle);
  color: var(--bs-success-text-emphasis);
}
</style>
