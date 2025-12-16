<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { processStatisticsResult } from "@/core/statistics/statistics"
import { type StatisticsProcessed } from "@/core/statistics/statistics.types"
import { useAppStore } from "@/store/useAppStore"
import { whenever } from "@vueuse/core"
import { computed, ref, useTemplateRef, watch, type VNode } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  active: boolean
}>()

const store = useAppStore()
const { t } = useI18n()

const attrs = ref<string[]>(["word"])
const corpora = ref<Corpus[]>(corpusSelection.corpora)
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<StatisticsProcessed>()
const gridEl = useTemplateRef("grid")

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

watch(data, async () => {
  if (!data.value) return
  if (!gridEl.value) throw new Error("Grid element missing")

  const statisticsGridModule = await import("@/core/statistics/statistics-grid")
  const { StatisticsGrid } = statisticsGridModule
  const grid = new StatisticsGrid(
    gridEl.value,
    data.value.rows,
    corpora.value.map((c) => c.id.toUpperCase()),
    attrs.value,
    store,
    t("result.statistics.total"),
    () => {},
    () => {},
  )
  grid.render()
  grid.resizeCanvas()
  grid.autosizeColumns()
})
</script>

<template>
  <div>
    <div ref="grid" role="grid"></div>
  </div>
</template>

<style scoped>
div[role="grid"] {
  height: 30em;
}
::v-deep div[role="columnheader"] {
  background-color: rgb(var(--bs-tertiary-bg-rgb));
}
::v-deep .slick-cell input[type="checkbox"] {
  margin-left: 2px;
}
</style>
