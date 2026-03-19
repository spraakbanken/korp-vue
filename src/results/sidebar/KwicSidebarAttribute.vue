<script setup lang="ts">
import type { Corpus } from "@/core/config/corpusConfig.types"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { useLocale } from "@/i18n/useLocale"
import DefaultFormatter from "./DefaultFormatter.vue"
import { computed, inject } from "vue"
import { injectionKeys } from "@/injection"
import { getConfigurable } from "@/core/config"
import type { Formatter } from "../formatter"
import type { RowToken } from "@/core/kwic/kwic"

const props = defineProps<{
  corpus: Corpus
  attribute: Attribute
  isCustom?: boolean
  rowToken: RowToken
  value: string | null | undefined
}>()

const { locObj } = useLocale()

const formatters = inject(injectionKeys.attribute.formatters, {})

const formatter = computed<Formatter>(() => {
  const def = props.attribute.sidebar_component
  return (def && getConfigurable(formatters, def)) || { component: DefaultFormatter }
})
</script>

<template>
  <div class="sidebar-attribute mb-1">
    <strong v-if="!attribute.sidebar_hide_label">{{ locObj(attribute.label) }}: </strong>
    <component
      :is="formatter.component"
      :attribute
      :isCustom
      :rowToken
      :value
      :options="formatter.options"
    />
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
