<script lang="ts" setup>
import type { TextTask } from "@/core/task/TextTask"
import { computed, inject, onMounted } from "vue"
import DefaultReader from "./DefaultReader.vue"
import { useLocale } from "@/i18n/useLocale"
import SidebarProvider from "../sidebar/SidebarProvider.vue"
import { useMatomo } from "vue3-matomo"
import { injectionKeys } from "@/injection"
import { getConfigurable } from "@/core/config"
import { type Reader } from "./text"
import { useResult } from "../useResult"
import ResultsDisplay from "../ResultsDisplay.vue"

const props = defineProps<{
  task: TextTask
}>()

const progress = defineModel<number>("progress")

const { locObj } = useLocale()
const matomo = useMatomo()

const readers = inject(injectionKeys.readers, {})

const reader = computed<Reader>(() => {
  const readingMode = props.task.corpus.reading_mode
  if (!readingMode) throw new Error("TextResults shown but corpus has no reading_mode defined")

  const name = readingMode === true ? "" : readingMode.component
  return getConfigurable(readers, name) || { component: DefaultReader }
})

onMounted(() => {
  loadResult()
  matomo.value?.trackEvent("Text", "New")
})

const load = () => props.task.send()
const { abort, data, errorMessage, state, loadResult } = useResult(progress, load, props.task)
</script>

<template>
  <h2>
    {{
      data?.structs.text_title || $t("result.reader.from", { corpus: locObj(task.corpus.title) })
    }}
  </h2>

  <SidebarProvider hide-reading-mode>
    <ResultsDisplay :errorMessage :state :populated="!!data" :progress @abort="abort()">
      <component
        :is="reader.component"
        v-if="data"
        :corpus="task.corpus"
        :document="data"
        :text-id="task.textId"
      />
    </ResultsDisplay>
  </SidebarProvider>
</template>
