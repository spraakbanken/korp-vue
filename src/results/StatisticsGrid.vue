<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import { getCqp } from "@/core/statistics/statistics"
import {
  isTotalRow,
  type Row,
  type SearchParams,
  type SingleRow,
} from "@/core/statistics/statistics.types"
import type { StatisticsGrid } from "@/core/statistics/statisticsGrid"
import { useAppStore } from "@/store/useAppStore"
import { useWindowSize, watchImmediate } from "@vueuse/core"
import { throttle } from "lodash"
import { onMounted, reactive, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  attributes: string[]
  params: SearchParams
  rows: Row[]
}>()

const emit = defineEmits<{
  (e: "clickValue", payload: { corpusIds: string[]; cqp?: string }): void
}>()

const store = useAppStore()
const { t } = useI18n()

let grid: StatisticsGrid
const gridEl = useTemplateRef("gridEl")

// Wait for the grid element ref to be set
onMounted(() => {
  // (Re)create grid whenever data comes in
  watchImmediate(() => props.rows, renderGrid)
})

// Update grid size when window is resized
watchImmediate(
  reactive(useWindowSize()),
  throttle(() => grid?.resize(), 100),
)

/** (Re)create and show the grid */
async function renderGrid() {
  if (!gridEl.value) throw new Error("Grid element missing")

  const statisticsGridModule = await import("@/core/statistics/statisticsGrid")
  const { StatisticsGrid } = statisticsGridModule
  grid = new StatisticsGrid(
    gridEl.value,
    props.rows,
    corpusSelection.getIds(true),
    props.attributes,
    store,
    t("result.statistics.total"),
    () => {}, // TODO Corpus distribution chart
    onValueClick,
  )
  grid.render()
}

/** Open a subsearch tab when clicking a frequency value */
function onValueClick(row: Row, corpusId?: string) {
  // If no specific corpus, find which corpora had any hits (uppercase ids)
  const corpusIds = corpusId
    ? [corpusId]
    : Object.keys(row.count).filter((id) => row.count[id]![0] > 0)

  // Add a subquery CQP matching a value row
  const cqp = !isTotalRow(row) ? buildExampleCqp(row) : undefined

  emit("clickValue", { corpusIds, cqp })
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
  <div ref="gridEl" role="grid"></div>
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

:deep(.slick-cell):has(input[type="checkbox"]),
:deep([role="columnheader"]):has(input[type="checkbox"]) {
  text-align: center;
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
