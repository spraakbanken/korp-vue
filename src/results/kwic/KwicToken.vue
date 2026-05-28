<script setup lang="ts">
import {
  isKwicRowToken,
  isPunctuation,
  isRowTokenEqual,
  parseWhitespace,
  type RowToken,
} from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { computed, inject } from "vue"

const props = defineProps<{
  rowToken: RowToken
}>()

const selectedToken = inject(injectionKeys.selectedToken)

const spaceBefore = computed(() => {
  const attrs = props.rowToken.token.attrs
  // Parse encoded whitespace
  if (typeof attrs._head == "string") return parseWhitespace(attrs._head)
  // Null means no space
  if (attrs._head === null) return ""
  // Default to a single space, except for punctuation tokens
  if (isKwicRowToken(props.rowToken) && isPunctuation(props.rowToken.token.word)) return ""
  return " "
})

const spaceAfter = computed(() => {
  const attrs = props.rowToken.token.attrs
  // Parse encoded whitespace
  if (typeof attrs._tail == "string") return parseWhitespace(attrs._tail)
  // Null means no space
  if (attrs._tail === null) return ""
  // Default to no space
  return ""
})

/** Check if this token is the dependency head of the selected token */
const isDepheadToSelected = computed(() => {
  if (!selectedToken?.value) return false
  const selected = selectedToken.value
  if (props.rowToken.row.id != selected.row.id) return false
  if (props.rowToken.token.attrs.sentence_id != selected.token.attrs.sentence_id) return false

  const dephead = selected.token.attrs.dephead
  const ref = props.rowToken.token.attrs.ref
  return dephead != undefined && ref != undefined && dephead == ref
})
</script>

<template>
  {{ spaceBefore
  }}<span
    class="kwic-token rounded-3 cursor-pointer"
    :class="{
      'fw-bold': isKwicRowToken(rowToken) && rowToken.token._match,
      'bg-success-subtle text-success-emphasis': isRowTokenEqual(selectedToken, rowToken),
      'bg-info-subtle text-info-emphasis': isDepheadToSelected,
      'text-muted': isKwicRowToken(rowToken) && !rowToken.token._matchSentence,
    }"
    @click.stop="selectedToken = rowToken"
    >{{ rowToken.token.word }}</span
  >{{ spaceAfter }}
</template>

<style lang="scss">
.kwic-token {
  transition: all 100ms ease-in-out;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
  }
}
</style>
