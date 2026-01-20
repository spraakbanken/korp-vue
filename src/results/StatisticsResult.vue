<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { processStatisticsResult } from "@/core/statistics/statistics"
import { type StatisticsProcessed } from "@/core/statistics/statistics.types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { whenever } from "@vueuse/core"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "./useDynamicTabs"
import StatisticsGrid from "./StatisticsGrid.vue"

const props = defineProps<{
  active: boolean
}>()

const store = useAppStore()
const { t } = useI18n()
const { createTab } = useDynamicTabs()

const attrs = ref<string[]>(["word"])
const corpora = ref<Corpus[]>(corpusSelection.corpora)
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<StatisticsProcessed>()

const proxy = new StatsProxy()

// Enable statistics when opening tab first time
whenever(
  () => props.active,
  () => {
    // Initial corpus selection may not have settled yet.
    if (corpusSelection.corpora.length) doSearch()
    else setTimeout(() => doSearch())
  },
  { once: true, immediate: true },
)

async function doSearch() {
  const attrsValue = attrs.value
  corpora.value = corpusSelection.corpora
  const cqpValue = cqp.value
  const originalCorpora = corpusSelection.stringify(false)
  const counts = await proxy.makeRequest(cqpValue, attrsValue)
  data.value = await processStatisticsResult(originalCorpora, counts, attrsValue, false, cqpValue)
}

function onSubsearch(task: ExampleTask) {
  createTab(t("result.kwic"), task)
}
</script>

<template>
  <div>
    <StatisticsGrid v-if="data" :rows="data.rows" :params="data.params" @subsearch="onSubsearch" />
  </div>
</template>
