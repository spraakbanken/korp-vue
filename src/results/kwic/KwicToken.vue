<script setup lang="ts">
import { isKwicRowToken, isRowTokenEqual, type RowToken } from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { isEqual } from "lodash-es"
import { computed, inject } from "vue"

const props = defineProps<{
  rowToken: RowToken
}>()

const selectedToken = inject(injectionKeys.selectedToken)

const isDepheadToSelected = computed(() => {
  const selected = selectedToken?.value
  if (!isKwicRowToken(props.rowToken) || !selected || !isKwicRowToken(selected)) return false
  if (!isEqual(props.rowToken.row, selected.row)) return false
  const token = props.rowToken.token
  if (!("dephead" in selected.token) || !(typeof selected.token.dephead == "string")) return false
  const head = selected.token.dephead
  if (!("ref" in token) || !(typeof token.ref == "string")) return false
  return token.ref == head
})
</script>

<template>
  {{ isKwicRowToken(rowToken) && rowToken.token._punct ? "" : " "
  }}<span
    class="kwic-token rounded-3"
    :class="{
      'fw-bold': isKwicRowToken(rowToken) && rowToken.token._match,
      'bg-success-subtle text-success-emphasis': isRowTokenEqual(selectedToken, rowToken),
      'bg-info-subtle text-info-emphasis': isDepheadToSelected,
    }"
    @click.stop="selectedToken = rowToken"
  >
    {{ rowToken.token.word }}
  </span>
</template>

<style lang="scss">
.kwic-token {
  cursor: pointer;
  transition: all 100ms ease-in-out;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
  }
}
</style>
