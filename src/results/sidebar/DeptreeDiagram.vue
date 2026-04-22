<script lang="ts" setup>
/** Dependency tree visualization using the DependencyTreeJS library */
import { computed, ref, useTemplateRef, watch, watchEffect } from "vue"
import DependencyTreeJs from "dependencytreejs/lib"
import type { SentenceSVGOptions } from "dependencytreejs/lib/SentenceSVG"
import type { KwicToken } from "@/core/kwic/kwic"
import { getDeptreeAttrMapping } from "@/core/config"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { useElementVisibility } from "@vueuse/core"
import { useLocale } from "@/i18n/useLocale"
import type { Attribute, DeptreeAttrMap } from "@/core/config/corpusConfigRaw.types"
import { mapValues } from "lodash-es"
import { useStringifiers } from "@/attributes/useStringifiers"

const { defaultSentenceSVGOptions, ReactiveSentence, SentenceSVG } = DependencyTreeJs

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

/** The input sentence in CoNLL format */
const conll = computed(() => props.tokens.map(tokenConll).join("\n"))

/** Cached deptree attribute mapping */
const attrMap = computed(() =>
  mapValues(getDeptreeAttrMapping(props.corpus), (attr) => props.corpus.attributes[attr]),
)

/** Build a token line for the CoNLL format */
function tokenConll(token: KwicToken): string {
  const ref = token.attrs[attrMap.value.ref.name]
  const pos = token.attrs[attrMap.value.pos.name]
  const head = token.attrs[attrMap.value.head.name] || "0"
  const rel = token.attrs[attrMap.value.rel.name]
  return [ref, token.word, "_", pos, "_", "_", head, rel, "_", "_"].join("\t")
}

watchEffect(() => {
  if (!svgEl.value || !isVisible.value) return
  const sentence = new ReactiveSentence()
  sentence.fromSentenceConll(conll.value)

  const options: SentenceSVGOptions = {
    ...defaultSentenceSVGOptions(),
    shownFeatures: ["UPOS"],
    arcHeight: 35,
    tokenSpacing: 20,
  }

  new SentenceSVG(svgEl.value, sentence, options)
  attachHoverHandler(".UPOS", "pos")
  attachHoverHandler(".DEPREL", "rel")
})

watch(isVisible, () => {
  if (!isVisible.value) selection.value = undefined
})

function attachHoverHandler(selector: string, name: keyof DeptreeAttrMap) {
  for (const el of svgEl.value?.querySelectorAll(selector) || []) {
    el.addEventListener("mouseover", () => {
      const attr = attrMap.value[name]
      const key = el.textContent
      selection.value = { attr, key }
    })
  }
}
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
