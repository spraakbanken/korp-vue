<script setup lang="ts">
import type { ApiKwic } from "@/core/backend/types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { storeToRefs } from "pinia"
import { onMounted, ref, watch } from "vue"
import KwicResultsContent from "./KwicResultsContent.vue"

const props = defineProps<{ task: ExampleTask }>()

const store = useAppStore()
const { hpp, reading_mode } = storeToRefs(store)
const hitsCount = ref(0)
const kwic = ref<ApiKwic[]>()
const loading = ref(false)
const page = ref(1)

onMounted(async () => {
  doSearch()
})

async function doSearch(isPaging = false) {
  loading.value = !isPaging
  const response = await props.task.send(page.value, hpp.value, isPaging, reading_mode.value)
  loading.value = false
  hitsCount.value = response.hits
  kwic.value = response.kwic
}

watch(page, () => doSearch(true))
</script>

<template>
  <div class="bg-body-tertiary p-2 d-flex gap-2 align-items-baseline">TODO Context checkbox</div>

  <KwicResultsContent :hitsCount :hpp :kwic v-model="page" />
</template>
