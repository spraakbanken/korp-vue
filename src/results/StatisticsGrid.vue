<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { getCqp } from "@/core/statistics/statistics"
import {
  isTotalRow,
  type Row,
  type SearchParams,
  type SingleRow,
} from "@/core/statistics/statistics.types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { computed, onMounted, ref, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  params: SearchParams
  rows: Row[]
}>()

const $emit = defineEmits<{
  (e: "subsearch", task: ExampleTask): void
}>()

const store = useAppStore()
const { t } = useI18n()

const attrs = ref<string[]>(["word"])
const corpora = ref<Corpus[]>(corpusSelection.corpora)
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const gridEl = useTemplateRef("grid")

const proxy = new StatsProxy()

onMounted(async () => {
  if (!gridEl.value) throw new Error("Grid element missing")

  const statisticsGridModule = await import("@/core/statistics/statisticsGrid")
  const { StatisticsGrid } = statisticsGridModule
  const grid = new StatisticsGrid(
    gridEl.value,
    props.rows,
    corpora.value.map((c) => c.id.toUpperCase()),
    attrs.value,
    store,
    t("result.statistics.total"),
    () => {}, // TODO Corpus distribution chart
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
  $emit("subsearch", task)
}

/** Create sub query for a given value row */
function buildExampleCqp(row: SingleRow) {
  // isPhraseLevelDisjunction can be set in custom code for constructing cqp like: ([] | [])
  if ("isPhraseLevelDisjunction" in row && row.isPhraseLevelDisjunction) {
    // In this case the statsValues array is one level deeper
    const statsValues = row.statsValues as unknown as Record<string, string[]>[][]
    const tokens = statsValues.map((vals) => getCqp(vals, props.params.ignoreCase))
    return tokens.join(" | ")
  }

  // Normal case
  return getCqp(row.statsValues, props.params.ignoreCase)
}
</script>

<template>
  <div ref="grid" role="grid"></div>
</template>

<style scoped>
[role="grid"] {
  height: 30em;
}

:deep(div[role="columnheader"]) {
  background-color: var(--bs-secondary-bg);
  font-weight: bold;
}

:deep(.slick-header-sortable) {
  cursor: pointer;
}

:deep(.slick-row:hover) {
  background-color: var(--bs-tertiary-bg);
}

:deep(.total-column) {
  background-color: #fff8f0;
}

:deep(.slick-row:hover .total-column) {
  background-color: #f6ede2;
}

:deep(.parameter-column) {
  background-color: #f1f7ff;
}

:deep(.slick-row:hover .parameter-column) {
  background-color: #e6ebff;
}

:deep(.slick-cell input[type="checkbox"]) {
  margin-left: 2px;
}

:deep(.distribution-cell),
:deep(.frequency-cell),
:deep(.value-cell) {
  cursor: pointer;
}

:deep(.frequency-cell):hover,
:deep(.value-cell):hover {
  color: var(--bs-primary);
  text-decoration: underline;
}

:deep(.frequency-cell) {
  text-align: right;
}
</style>
