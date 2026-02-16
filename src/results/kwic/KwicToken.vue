<script setup lang="ts">
import type { ApiKwic, Token } from "@/core/backend/types"
import { injectionKeys } from "@/injection"
import { isEqual } from "lodash-es"
import { computed, inject } from "vue"

const props = defineProps<{
  row: ApiKwic
  token: Token
}>()

const selectedToken = inject(injectionKeys.selectedToken)
const isSelected = computed(() => {
  const value = selectedToken?.value
  if (!value) return
  return isEqual(value.row.match, props.row.match) && value.token.position == props.token.position
})
</script>

<template>
  {{ token._punct ? "" : " "
  }}<span
    class="kwic-token rounded-3"
    :class="{
      'fw-bold': token._match,
      'kwic-token-selected': isSelected,
    }"
    @click.stop="selectedToken = { token, row }"
  >
    {{ token.word }}
  </span>
</template>

<style lang="scss">
.kwic-token {
  cursor: pointer;
  transition: 100ms ease-in-out;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
  }
}

.kwic-token-selected {
  background-color: var(--bs-success-bg-subtle);
  color: var(--bs-success-text-emphasis);
}
</style>
