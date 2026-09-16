<script setup lang="ts">
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { computed, onMounted, ref, watch } from "vue"
import KwicResultsContent from "./KwicResultsContent.vue"
import { debounce } from "lodash-es"
import HelpBadge from "@/components/HelpBadge.vue"
import type { WordpicExampleTask } from "@/core/task/WordpicExampleTask"
import OptionsBar from "@/components/OptionsBar.vue"
import { massageData } from "@/core/kwic/kwic"
import KwicExportButton from "./KwicExportButton.vue"
import { useResult } from "../useResult"
import ResultsDisplay from "../ResultsDisplay.vue"

const UPDATE_DELAY_MS = 500

const props = defineProps<{ task: ExampleTask | WordpicExampleTask }>()

const progress = defineModel<number>("progress")

const store = useAppStore()

const hpp = store.hpp
// Enable context if the task is reading-initialized, otherwise copy the main KWIC option in store
const context = ref(props.task.isReadingInit || store.reading_mode)
const isReading = ref(store.reading_mode)
const page = ref(1)

onMounted(() => loadResult())

async function load(updating = false) {
  const willBeReading = context.value
  const response = await props.task.send(page.value - 1, hpp, updating, context.value)
  isReading.value = willBeReading
  return response
}

const { data, loadResult } = useResult(progress, load, props.task)

const distribution = computed(() => data.value?.distribution)
const hitsCount = computed(() => data.value?.hits || 0)
const kwic = computed(() => data.value && massageData(data.value.kwic))

/** When search options are changed, update the search. Debounce to avoid lag in case of quick changes. */
const onOptionsChange = debounce(() => loadResult(true), UPDATE_DELAY_MS)

watch(page, () => loadResult(true))
</script>

<template>
  <div class="vstack gap-2">
    <OptionsBar>
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

      <template #end>
        <KwicExportButton :kwic :proxy="task.proxy" :totalHits="hitsCount" />
      </template>
    </OptionsBar>

    <ResultsDisplay :populated="!!hitsCount">
      <KwicResultsContent
        :corpora="task.corpora"
        :distribution
        :hitsCount
        :hpp
        :isReading
        :kwic
        v-model="page"
      />
    </ResultsDisplay>
  </div>
</template>
