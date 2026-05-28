<script lang="ts" setup>
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import type { TextTask } from "@/core/task/TextTask"
import { computed, inject, onMounted, shallowRef } from "vue"
import DefaultReader from "./DefaultReader.vue"
import type { KwicRow } from "@/core/kwic/kwic"
import { useLocale } from "@/i18n/useLocale"
import SidebarProvider from "../sidebar/SidebarProvider.vue"
import { useMatomo } from "vue3-matomo"
import { injectionKeys } from "@/injection.ts"
import { getConfigurable } from "@/core/config/index.ts"
import { type Reader } from "./text"

const props = defineProps<{
  task: TextTask
}>()

const progress = defineModel<number>("progress")

const { locObj } = useLocale()
const matomo = useMatomo()

const readers = inject(injectionKeys.readers, {})
const document = shallowRef<KwicRow>()

const reader = computed<Reader>(() => {
  const readingMode = props.task.corpus.reading_mode
  if (!readingMode) throw new Error("TextResults shown but corpus has no reading_mode defined")

  const name = readingMode === true ? "" : readingMode.component
  return getConfigurable(readers, name) || { component: DefaultReader }
})

onMounted(() => {
  doSearch()
  matomo.value?.trackEvent("Text", "New")
})

async function doSearch() {
  props.task.abort()
  progress.value = 0
  try {
    document.value = await props.task.send()
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    throw error
  }
}
</script>

<template>
  <h2>
    {{ locObj(task.corpus.title) }} –
    {{ $t("result.reader.id", { id: task.textId }) }}
  </h2>

  <SidebarProvider>
    <component
      :is="reader.component"
      v-if="document"
      :corpus="task.corpus"
      :document
      :text-id="task.textId"
    />
  </SidebarProvider>
</template>
