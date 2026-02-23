<script setup lang="ts">
import { getAttrValues } from "@/core/backend/attrValues"
import type { WidgetProps } from "./widget"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { watchImmediate } from "@vueuse/core"
import { uniq } from "lodash-es"
import { locObj } from "@/core/i18n"
import { useI18n } from "vue-i18n"
import { ref } from "vue"

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps>()

const corpusSelection = useReactiveCorpusSelection()
const { locale } = useI18n()

const loading = ref(false)
const options = ref<[string, string][]>([])

const getLabel = (value: string) =>
  locObj(props.attribute.translation?.[value] || value, locale.value)

watchImmediate([corpusSelection, () => props.attribute, locale], async () => {
  // Temporarily empty the selection to show the loading label
  const prevValue = model.value
  model.value = ""

  // Load values from backend
  loading.value = true
  const values = await loadValues()
  loading.value = false

  // Format options list
  options.value = uniq(values)
    .map((value) => [value, getLabel(value)] as [string, string])
    .sort((a, b) => a[1].localeCompare(b[1], locale.value))

  // Restore or reset selection
  model.value = values.includes(prevValue) ? prevValue : options.value[0]?.[0] || ""
})

async function loadValues() {
  const name = props.attribute.name
  const split = props.attribute.type == "set"

  // check which corpora support attributes
  const corpora = corpusSelection.corpora
    .filter((corpus) => name in corpus.struct_attributes || name in corpus.attributes)
    .map((corpus) => corpus.id)

  if (!corpora.length) return []
  return getAttrValues(corpora, name, split)
}
</script>

<template>
  <select class="form-select" v-model="model" :disabled="loading">
    <option v-if="loading" disabled value="">{{ $t("loading") }}</option>
    <option v-for="[value, label] in options" :key="value" :value>
      {{ label }}
    </option>
  </select>
</template>
