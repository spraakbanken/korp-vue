<script setup lang="ts">
import type { ApiKwic } from "@/core/backend/types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { storeToRefs } from "pinia"
import { onMounted, ref, watch } from "vue"
import KwicResultsContent from "./kwic/KwicResultsContent.vue"
import { debounce } from "lodash"
import HelpBadge from "@/components/HelpBadge.vue"
import type { WordpicExampleTask } from "@/core/task/WordpicExampleTask"

const UPDATE_DELAY_MS = 500

const props = defineProps<{ task: ExampleTask | WordpicExampleTask }>()

const store = useAppStore()
const { hpp } = storeToRefs(store)
const context = ref(store.reading_mode)
const hitsCount = ref(0)
const isReading = ref(store.reading_mode)
const kwic = ref<ApiKwic[]>()
const loading = ref(false)
const page = ref(1)

onMounted(async () => {
  doSearch()
})

async function doSearch(isPaging = false) {
  loading.value = !isPaging
  const willBeReading = context.value
  const response = await props.task.send(page.value - 1, hpp.value, isPaging, context.value)
  loading.value = false
  hitsCount.value = response.hits
  kwic.value = response.kwic
  isReading.value = willBeReading
}

/** When search options are changed, update the search. Debounce to avoid lag in case of quick changes. */
const onOptionsChange = debounce(() => {
  doSearch()
}, UPDATE_DELAY_MS)

watch(page, () => doSearch(true))
</script>

<template>
  <div class="vstack gap-2">
    <div class="bg-secondary-subtle p-2 d-flex gap-4 align-items-baseline">
      <label class="form-check-label">
        <input
          type="checkbox"
          v-model="context"
          class="form-check-input"
          @change="onOptionsChange"
        />
        {{ $t("result.kwic.show_context") }}
        <HelpBadge :text="$t('result.kwic.show_context.help')" />
      </label>
    </div>

    <KwicResultsContent :hitsCount :hpp :isReading :kwic v-model="page" />
  </div>
</template>
