<script setup lang="ts">
import { isKwicRowToken, isRowTokenEqual, type RowToken } from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { computed, inject } from "vue"

const props = defineProps<{
  rowToken: RowToken
}>()

const selectedToken = inject(injectionKeys.selectedToken)

/** Check if this token is the dependency head of the selected token */
const isDepheadToSelected = computed(() => {
  if (!selectedToken?.value) return false
  const selected = selectedToken.value
  if (props.rowToken.row.id != selected.row.id) return false

  const dephead = selected.token.attrs.dephead
  const ref = props.rowToken.token.attrs.ref
  return dephead != undefined && ref != undefined && dephead == ref
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
      'text-muted': isKwicRowToken(rowToken) && !rowToken.token._matchSentence,
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
