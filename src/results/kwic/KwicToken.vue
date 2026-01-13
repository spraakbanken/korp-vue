<script setup lang="ts">
import type { Token } from "@/core/backend/types"
import type { Row } from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { computed, inject, useId } from "vue"

defineProps<{
  row: Row
  token: Token
}>()

/** Unique identifier for this component instance. Used for tracking selected token. */
const id = useId()

const tokenSelection = inject(injectionKeys.kwicTokenSelection)
const isSelected = computed(() => tokenSelection?.get()?.id == id)
</script>

<template>
  <span
    class="kwic-token text-nowrap rounded-3"
    :class="{
      'fw-bold': token._match,
      'kwic-token-punct': token._punct,
      'kwic-token-selected': isSelected,
    }"
    @click.stop="tokenSelection?.select(id, token, row)"
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
