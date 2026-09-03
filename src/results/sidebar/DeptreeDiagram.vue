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
import { useMatomo } from "vue3-matomo"

const props = defineProps<{
  corpus: Corpus
  tokens: KwicToken[]
}>()

const svgEl = useTemplateRef<SVGElement>("svg")
const isVisible = useElementVisibility(svgEl)
const getStringifier = useStringifiers()
const { locObj } = useLocale()
const matomo = useMatomo()

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
  if (isVisible.value) matomo.value?.trackEvent("KWIC", "Show deptree")
  else selection.value = undefined
})
</script>

<template>
  <div class="text-center">
    <div class="overflow-x-auto">
      <svg ref="svg" class="deptreeSvg"></svg>
    </div>
    <div class="mt-2">
      <template v-if="selection">
        <strong class="text-info small">{{ selection.key }}</strong>
        ({{ locObj(selection.attr.label) }}):
        {{ getStringifier(selection.attr)(selection.key) }}
      </template>
      <template v-else>&nbsp;</template>
    </div>
  </div>
</template>

<style>
.deptreeSvg .FORM,
.deptreeSvg .arrowhead {
  fill: var(--bs-body-color);
}
.deptreeSvg .curve,
.deptreeSvg .arrowhead {
  stroke: var(--bs-body-color);
}
.deptreeSvg .UPOS,
.deptreeSvg .DEPREL {
  font-weight: bold;
  fill: var(--bs-info);
  font-size: 0.8em;
}
</style>
