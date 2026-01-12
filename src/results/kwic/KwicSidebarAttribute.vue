<script setup lang="ts">
import type { Corpus } from "@/core/config/corpusConfig.types"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { useLocale } from "@/i18n/useLocale"

defineProps<{
  corpus: Corpus
  attribute: Attribute
  value: unknown
}>()

const { locObj } = useLocale()
</script>

<template>
  <div class="sidebar-attribute mb-1">
    <strong>{{ locObj(attribute.label) }}:</strong>
    {{ value }}
  </div>
</template>

<style scoped lang="scss">
.sidebar-attribute {
  text-indent: -1em;
  margin-inline-start: 1em;
  * {
    // Undo hanging indent for block/inline-block children
    text-indent: 0;
    margin-inline-start: 0;
  }
}
</style>
