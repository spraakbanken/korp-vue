<script setup lang="ts">
import settings from "@/core/config"
import {
  isKwicRowToken,
  isLinkedKwicRowToken,
  isPunctuation,
  isRowTokenEqual,
  parseWhitespace,
  type RowToken,
} from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"
import { compact } from "lodash-es"
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

/** In parallel mode, check if this token is linked to the selected token */
const isLinkedToSelected = computed(() => {
  if (!settings.parallel) return false
  if (!selectedToken?.value) return false
  const selected = selectedToken.value

  // Selected token must be in the linked row.
  if (selected.row.id != props.rowToken.row.link) return false

  // Selected token must not be in the same row.
  const linked = [props.rowToken, selected].find(isLinkedKwicRowToken)
  const main = [props.rowToken, selected].find((x) => !isLinkedKwicRowToken(x))
  if (!linked || !main || linked == main) return false

  // Get language of the linked corpus from its corpus id
  const [, lang] = linked.row.corpus.split("-")
  // Check the token link
  const linkrefs = compact(main.token.attrs[`wordlink-${lang}`]?.split("|")).map(Number)
  return linkrefs.includes(Number(linked.token.attrs.linkref))
})
</script>

<template>
  {{ spaceBefore
  }}<a
    href="#"
    :tabindex="
      // Disable tabbing between tokens, because they are too many.
      // But enable tabbing between surrounding elements and the currently selected token.
      // Other tokens can be selected using arrow keys instead, see SidebarProvider.
      isRowTokenEqual(selectedToken, rowToken) ? 0 : -1
    "
    class="kwic-token rounded-3 cursor-pointer text-decoration-none"
    :class="{
      'fw-bold': isKwicRowToken(rowToken) && rowToken.token._match,
      'bg-success-subtle text-success-emphasis': isRowTokenEqual(selectedToken, rowToken),
      'bg-info-subtle text-info-emphasis': isDepheadToSelected,
      'bg-warning-subtle text-warning-emphasis': isLinkedToSelected,
      'text-muted': isKwicRowToken(rowToken) && !rowToken.token._matchSentence,
    }"
    @click.prevent.stop="selectedToken = rowToken"
    >{{ rowToken.token.word }}</a
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
