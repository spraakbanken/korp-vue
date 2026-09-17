<script setup lang="ts">
import ModalDialog, { type ConfirmDialog } from "@/components/ModalDialog.vue"
import { corpusListing } from "@/core/corpora/corpusListing"
import { getCqp } from "@/core/statistics/statistics"
import {
  isTotalRow,
  type Row,
  type SearchParams,
  type SingleRow,
} from "@/core/statistics/statistics.types"
import type { StatisticsGrid } from "@/core/statistics/statisticsGrid"
import { useAppStore } from "@/store/useAppStore"
import { useElementVisibility, useWindowSize, watchImmediate } from "@vueuse/core"
import { throttle } from "lodash-es"
import { storeToRefs } from "pinia"
import { onMounted, reactive, shallowRef, useTemplateRef, watch } from "vue"
import { useI18n } from "vue-i18n"
import CorpusDistributionChart from "./CorpusDistributionChart.vue"

const props = defineProps<{
  attributes: string[]
  params: SearchParams
  rows: Row[]
}>()

const rowsSelected = defineModel<Row[]>({ required: true })

const emit = defineEmits<{
  (e: "clickValue", payload: { corpusIds: string[]; cqp?: string }): void
}>()

const store = useAppStore()
const { t } = useI18n()

let grid: StatisticsGrid | undefined
const gridEl = useTemplateRef("grid")
const isVisible = useElementVisibility(gridEl)
const { lang, statsRelative } = storeToRefs(store)
let distributionDialog: ConfirmDialog | undefined
const distributionRow = shallowRef<Row>()

// Wait for the grid element ref to be set
onMounted(() => {
  // (Re)create grid whenever data comes in
  watchImmediate(() => props.rows, renderGrid)
})

// Update grid size when window is resized, unless not currently visible
watch(
  [reactive(useWindowSize()), isVisible],
  throttle(() => isVisible && grid?.resizeCanvas(), 100),
  { flush: "post" },
)

/** (Re)create and show the grid */
async function renderGrid() {
  if (!gridEl.value) throw new Error("Grid element missing")

  const corpusIds = corpusListing.pick(props.params.corpora).stringify(true).split(",")

  const statisticsGridModule = await import("@/core/statistics/statisticsGrid")
  const { StatisticsGrid } = statisticsGridModule
  grid = new StatisticsGrid(
    gridEl.value,
    props.rows,
    corpusIds,
    props.attributes,
    t("result.statistics.total"),
    () => store.lang,
    () => store.statsRelative,
    (rows) => (rowsSelected.value = rows),
    onDistributionClick,
    onValueClick,
  )
  grid.render()

  // Make sure previous chart instance isn't reused.
  distributionRow.value = undefined
}

watch([lang, statsRelative], () => grid?.refreshColumns())

/** Open a subsearch tab when clicking a frequency value */
function onValueClick(row: Row, corpusId?: string) {
  // Unless corpus is given, find which corpora had any hits (uppercase ids)
  const corpusIdsWithHits = corpusId
    ? [corpusId]
    : Object.keys(row.count).filter((id) => row.count[id]![0] > 0)
  const corpusIds = props.params.originalCorpora
    .split(",")
    .filter((linkId) => corpusIdsWithHits.includes(linkId.split("|").shift()!))

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

function onDistributionClick(row: Row): void {
  distributionRow.value = row
  distributionDialog?.reveal()
}
</script>

<template>
  <div>
    <div ref="grid" style="height: 90svh" />
    <ModalDialog
      :title="t('result.statistics.distributions.title')"
      :size="params.corpora.length > 10 ? 'lg' : 'md'"
      @setup="distributionDialog = $event"
    >
      <CorpusDistributionChart v-if="distributionRow" :row="distributionRow" />
    </ModalDialog>
  </div>
</template>
