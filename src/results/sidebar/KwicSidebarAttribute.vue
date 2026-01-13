<script setup lang="ts">
import type { Corpus } from "@/core/config/corpusConfig.types"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { useLocale } from "@/i18n/useLocale"
import DefaultFormatter from "./DefaultFormatter.vue"

defineProps<{
  corpus: Corpus
  attribute: Attribute
  value: string | undefined
}>()

const { locObj } = useLocale()

const formatterComponent = DefaultFormatter
</script>

<template>
  <div class="sidebar-attribute mb-1">
    <strong>{{ locObj(attribute.label) }}: </strong>
    <component :is="formatterComponent" :attribute :value />
  </div>
</template>

<style scoped lang="scss">
.sidebar-attribute {
  // Hanging indent
  text-indent: -1em;
  margin-inline-start: 1em;
  * {
    // Undo hanging indent for block/inline-block children
    text-indent: 0;
    margin-inline-start: 0;
  }
}
</style>
