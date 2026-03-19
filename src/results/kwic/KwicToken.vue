<script setup lang="ts">
import { isKwicRowToken, isRowTokenEqual, type RowToken } from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { inject } from "vue"

defineProps<{
  rowToken: RowToken
}>()

const selectedToken = inject(injectionKeys.selectedToken)
</script>

<template>
  {{ isKwicRowToken(rowToken) && rowToken.token._punct ? "" : " "
  }}<span
    class="kwic-token rounded-3"
    :class="{
      'fw-bold': isKwicRowToken(rowToken) && rowToken.token._match,
      'kwic-token-selected': isRowTokenEqual(selectedToken, rowToken),
    }"
    @click.stop="selectedToken = rowToken"
  >
    {{ rowToken.token.word }}
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
