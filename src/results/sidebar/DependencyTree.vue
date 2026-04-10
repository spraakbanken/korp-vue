<script lang="ts" setup>
import { computed, useTemplateRef, watchEffect } from "vue"
import DependencyTreeJs from "dependencytreejs/lib"
import type { SentenceSVGOptions } from "dependencytreejs/lib/SentenceSVG"
import type { KwicToken } from "@/core/kwic/kwic"

const { defaultSentenceSVGOptions, ReactiveSentence, SentenceSVG } = DependencyTreeJs

const props = defineProps<{
  tokens: KwicToken[]
}>()

const svgEl = useTemplateRef<SVGElement>("svg")

const conll = computed(() =>
  props.tokens
    .map((token) => {
      const { ref, pos, deprel, dephead } = token.attrs
      return [ref, token.word, "_", pos, "_", "_", dephead || "0", deprel, "_", "_"].join("\t")
    })
    .join("\n"),
)

watchEffect(() => {
  if (!svgEl.value) return
  const sentence = new ReactiveSentence()
  sentence.fromSentenceConll(conll.value)

  const options: SentenceSVGOptions = {
    ...defaultSentenceSVGOptions(),
    arcHeight: 35,
    tokenSpacing: 20,
  }

  new SentenceSVG(svgEl.value, sentence, options)
})
</script>

<template>
  <div class="overflow-x-auto">
    <svg id="svgWrapper" ref="svg" width="400" height="220" />
  </div>
</template>
