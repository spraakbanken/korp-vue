<script lang="ts" setup>
/** Dependency tree visualization using the DependencyTreeJS library */
import { computed, useTemplateRef, watchEffect } from "vue"
import DependencyTreeJs from "dependencytreejs/lib"
import type { SentenceSVGOptions } from "dependencytreejs/lib/SentenceSVG"
import type { KwicToken } from "@/core/kwic/kwic"
import { getDeptreeAttrMapping } from "@/core/config"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { useElementVisibility } from "@vueuse/core"

const { defaultSentenceSVGOptions, ReactiveSentence, SentenceSVG } = DependencyTreeJs

const props = defineProps<{
  corpus: Corpus
  tokens: KwicToken[]
}>()

const svgEl = useTemplateRef<SVGElement>("svg")
const isVisible = useElementVisibility(svgEl)

/** The input sentence in CoNLL format */
const conll = computed(() => props.tokens.map(tokenConll).join("\n"))

/** Cached deptree attribute mapping */
const deptreeAttrMapping = computed(() => getDeptreeAttrMapping(props.corpus))

/** Build a token line for the CoNLL format */
function tokenConll(token: KwicToken): string {
  const mapping = deptreeAttrMapping.value
  const ref = token.attrs[mapping.ref]
  const pos = token.attrs[mapping.pos]
  const head = token.attrs[mapping.head] || "0"
  const rel = token.attrs[mapping.rel]
  return [ref, token.word, "_", pos, "_", "_", head, rel, "_", "_"].join("\t")
}

watchEffect(() => {
  if (!svgEl.value || !isVisible.value) return
  const sentence = new ReactiveSentence()
  sentence.fromSentenceConll(conll.value)

  // TODO Explain rel/pos abbreviations (on hover?)
  const options: SentenceSVGOptions = {
    ...defaultSentenceSVGOptions(),
    shownFeatures: ["UPOS"],
    arcHeight: 35,
    tokenSpacing: 20,
  }

  new SentenceSVG(svgEl.value, sentence, options)
})
</script>

<template>
  <div class="overflow-x-auto text-center fs-6">
    <svg id="svgWrapper" ref="svg" width="400" height="220"></svg>
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
