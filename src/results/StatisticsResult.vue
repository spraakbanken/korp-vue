<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { getCqp, processStatisticsResult } from "@/core/statistics/statistics"
import {
  isTotalRow,
  type Row,
  type SingleRow,
  type StatisticsProcessed,
} from "@/core/statistics/statistics.types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { whenever } from "@vueuse/core"
import { computed, ref, useTemplateRef, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "./useDynamicTabs"

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
    onValueClick,
  )
  grid.render()
  grid.resizeCanvas()
  grid.autosizeColumns()
})

/** Open an subsearch tab when clicking a frequency value */
function onValueClick(row: Row, corpusId?: string) {
  const cqps = [cqp.value]

  // Add a subquery CQP matching a value row
  if (!isTotalRow(row)) cqps.push(buildExampleCqp(row))

  // Unless corpus is given, find which corpora had any hits (uppercase ids)
  const corpora = corpusId
    ? [corpusId]
    : Object.keys(row.count).filter((id) => row.count[id]![0] > 0)

  const task = new ExampleTask(corpora, cqps, proxy.getParams().default_within, store.reading_mode)
  createTab(t("result.kwic"), task)
}

/** Create sub query for a given value row */
function buildExampleCqp(row: SingleRow) {
  if (!data.value) throw new Error("Missing statistics data")
  const params = data.value.params

  // isPhraseLevelDisjunction can be set in custom code for constructing cqp like: ([] | [])
  if ("isPhraseLevelDisjunction" in row && row.isPhraseLevelDisjunction) {
    // In this case the statsValues array is one level deeper
    const statsValues = row.statsValues as unknown as Record<string, string[]>[][]
    const tokens = statsValues.map((vals) => getCqp(vals, params.ignoreCase))
    return tokens.join(" | ")
  }

  // Normal case
  return getCqp(row.statsValues, params.ignoreCase)
}
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
:deep(div[role="columnheader"]) {
  background-color: rgb(var(--bs-tertiary-bg-rgb));
}
:deep(.slick-cell input[type="checkbox"]) {
  margin-left: 2px;
}
</style>
