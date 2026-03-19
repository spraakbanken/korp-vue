<script setup lang="ts">
import { isKwicRowToken, isLinkedKwicRowToken, type RowToken } from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { isEqual } from "lodash-es"
import { computed, inject } from "vue"

const props = defineProps<{
  rowToken: RowToken
}>()

const selectedToken = inject(injectionKeys.selectedToken)

const isSelected = computed(() => {
  const selected = selectedToken?.value
  if (!selected) return

  if (isKwicRowToken(props.rowToken) && isKwicRowToken(selected))
    return (
      selected.token.position == props.rowToken.token.position &&
      isEqual(selected.row.match, props.rowToken.row.match)
    )

  if (isLinkedKwicRowToken(props.rowToken) && isLinkedKwicRowToken(selected))
    return (
      selected.token.linkref == props.rowToken.token.linkref &&
      isEqual(selected.row, props.rowToken.row)
    )

  return false
})
</script>

<template>
  {{ isKwicRowToken(rowToken) && rowToken.token._punct ? "" : " "
  }}<span
    class="kwic-token rounded-3"
    :class="{
      'fw-bold': isKwicRowToken(rowToken) && rowToken.token._match,
      'kwic-token-selected': isSelected,
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
