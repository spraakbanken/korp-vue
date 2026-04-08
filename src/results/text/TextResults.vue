<script lang="ts" setup>
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import type { TextTask } from "@/core/task/TextTask"
import { onMounted, shallowRef } from "vue"
import DefaultReader from "./DefaultReader.vue"
import type { KwicRow } from "@/core/kwic/kwic"
import { useLocale } from "@/i18n/useLocale"
import SidebarProvider from "../sidebar/SidebarProvider.vue"

const props = defineProps<{
  task: TextTask
}>()

const progress = defineModel<number>("progress")

const { locObj } = useLocale()

const document = shallowRef<KwicRow>()

onMounted(() => doSearch())

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
    <DefaultReader v-if="document" :corpus="task.corpus" :document :text-id="task.textId" />
  </SidebarProvider>
</template>
