<script lang="ts" setup>
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import type { TextTask } from "@/core/task/TextTask"
import { computed, inject, onMounted, shallowRef } from "vue"
import DefaultReader from "./DefaultReader.vue"
import type { KwicRow } from "@/core/kwic/kwic"
import { useLocale } from "@/i18n/useLocale"
import SidebarProvider from "../sidebar/SidebarProvider.vue"
import { useMatomo } from "vue3-matomo"
import { injectionKeys } from "@/injection"
import { getConfigurable } from "@/core/config"
import { type Reader } from "./text"
import { useResultState } from "../useResultState.ts"

const props = defineProps<{
  task: TextTask
}>()

const progress = defineModel<number>("progress")

const { errorMessage, state, setError, setState, listenAbort } = useResultState()
const { locObj } = useLocale()
const matomo = useMatomo()

const readers = inject(injectionKeys.readers, {})
const document = shallowRef<KwicRow>()

listenAbort(() => {
  props.task.abort()
  progress.value = undefined
})

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
  setState("loading")
  try {
    document.value = await props.task.send()
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    setError(error)
    return
  }
  setState("done")
}
</script>

<template>
  <h2>
    {{
      document?.structs.text_title ||
      $t("result.reader.from", { corpus: locObj(task.corpus.title) })
    }}
  </h2>

  <SidebarProvider hide-reading-mode>
    <component
      :is="reader.component"
      v-if="document"
      :corpus="task.corpus"
      :document
      :text-id="task.textId"
    />

    <div v-if="state == 'aborted'" class="alert alert-warning align-self-center">
      {{ $t("result.aborted") }}
    </div>

    <ErrorBox v-if="errorMessage" v-bind="errorMessage" class="mx-auto mb-0" />
  </SidebarProvider>
</template>
