<script lang="ts" setup>
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import type { TextReaderData, TextTask } from "@/core/task/TextTask"
import { onMounted, shallowRef } from "vue"
import DefaultReader from "./DefaultReader.vue"

const props = defineProps<{
  task: TextTask
}>()

const progress = defineModel<number>("progress")

const document = shallowRef<TextReaderData>()

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
  <DefaultReader v-if="document" :corpus="task.corpus" :document :sentence="task.sentenceData" />
</template>
