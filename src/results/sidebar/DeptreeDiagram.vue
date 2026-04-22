<script lang="ts" setup>
/** Dependency tree visualization using the DependencyTreeJS library */
import { computed, ref, useTemplateRef, watch, watchEffect } from "vue"
import type { KwicToken } from "@/core/kwic/kwic"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { useElementVisibility } from "@vueuse/core"
import { useLocale } from "@/i18n/useLocale"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { useStringifiers } from "@/attributes/useStringifiers"
import { createConll, drawDeptree, getDeptreeAttributes } from "./deptree"

const props = defineProps<{
  corpus: Corpus
  tokens: KwicToken[]
}>()

const svgEl = useTemplateRef<SVGElement>("svg")
const isVisible = useElementVisibility(svgEl)
const getStringifier = useStringifiers()
const { locObj } = useLocale()

/** Selected (hovered) tag to show legend/translation for */
const selection = ref<{ attr: Attribute; key: string }>()

/** Cached deptree attribute mapping */
const attrMap = computed(() => getDeptreeAttributes(props.corpus))

/** The input sentence in CoNLL format */
const conll = computed(() => createConll(props.tokens, attrMap.value))

// Reactively redraw deptree SVG
watchEffect(() => {
  if (!svgEl.value || !isVisible.value) return
  drawDeptree(svgEl.value, conll.value, (attr, key) => {
    selection.value = { attr: attrMap.value[attr], key }
  })
})

// Reset selection when diagram is hidden
watch(isVisible, () => {
  if (!isVisible.value) selection.value = undefined
})
</script>

<template>
  <div class="text-center">
    <div class="overflow-x-auto">
      <svg ref="svg"></svg>
    </div>
    <div class="mt-2">
      <template v-if="selection">
        <strong class="text-info font-family-heading small">{{ selection.key }}</strong>
        ({{ locObj(selection.attr.label) }}):
        {{ getStringifier(selection.attr)(selection.key) }}
      </template>
      <template v-else> &nbsp;</template>
    </div>
  </div>
</template>

<style scoped>
svg:deep(*) {
  font-size: inherit;
}
svg:deep(.UPOS),
svg:deep(.DEPREL) {
  font-family: var(--font-family-heading);
  font-weight: bold;
  fill: var(--bs-info);
  font-size: 0.8em;
}
</style>
