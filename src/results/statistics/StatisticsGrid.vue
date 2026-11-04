<script setup lang="ts">
import ModalDialog, { type ConfirmDialog } from "@/components/ModalDialog.vue"
import { corpusListing } from "@/core/corpora/corpusListing"
import { getRowCqp } from "@/core/statistics/statistics"
import {
  isTotalRow,
  type Row,
  type SingleRow,
  type StatisticsResult,
} from "@/core/statistics/statistics.types"
import type { StatisticsGrid } from "@/core/statistics/statisticsGrid"
import { useAppStore } from "@/store/useAppStore"
import { useElementVisibility, useWindowSize, watchImmediate } from "@vueuse/core"
import { throttle } from "lodash-es"
import { storeToRefs } from "pinia"
import { computed, onMounted, reactive, shallowRef, useTemplateRef, watch } from "vue"
import { useI18n } from "vue-i18n"
import CorpusDistributionChart from "./CorpusDistributionChart.vue"
import { useStringifiers } from "@/attributes/useStringifiers.ts"
import { fromKeys } from "@/core/util.ts"
import type { ListStringifier, Stringifier } from "@/core/corpora/attributes.types.ts"

const props = defineProps<{
  attributes: string[]
  result: StatisticsResult
  stringifiers: Record<string, { token: Stringifier; list?: ListStringifier }>
}>()

const rowsSelected = defineModel<Row[]>({ required: true })

const emit = defineEmits<{
  (e: "clickValue", payload: { corpusIds: string[]; cqp?: string }): void
}>()

const store = useAppStore()
const { getCqpStringifier } = useStringifiers()
const { t } = useI18n()

let grid: StatisticsGrid | undefined
const gridEl = useTemplateRef("gridEl")
const isVisible = useElementVisibility(gridEl)
const { lang, statsRelative } = storeToRefs(store)
let distributionDialog: ConfirmDialog | undefined
const distributionRow = shallowRef<Row>()

/** Get searched corpora from the totals row */
const corpora = computed(() => Object.keys(props.result.rows[0].corpora))

// Wait for the grid element ref to be set
onMounted(() => {
  // (Re)create grid whenever data comes in
  watchImmediate(() => props.result.rows, renderGrid)
})

// Update grid size when window is resized, unless not currently visible
watch(
  [reactive(useWindowSize()), isVisible],
  throttle(() => isVisible && grid?.resize(), 100),
  { flush: "post" },
)

/** (Re)create and show the grid */
async function renderGrid() {
  if (!gridEl.value) throw new Error("Grid element missing")

  const corpusIds = corpusListing.pick(corpora.value).getIds(true)

  const statisticsGridModule = await import("@/core/statistics/statisticsGrid")
  const { StatisticsGrid } = statisticsGridModule
  grid = new StatisticsGrid(
    gridEl.value,
    props.result.rows,
    corpusIds,
    props.attributes,
    props.stringifiers,
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
  const corpusIdsWithHits = corpusId ? [corpusId] : Object.keys(row.corpora)
  const corpusIds = props.result.originalCorpora.filter((linkId) =>
    corpusIdsWithHits.includes(linkId.split("|").shift()!),
  )

  // Add a subquery CQP matching a value row
  const cqp = !isTotalRow(row) ? buildExampleCqp(row) : undefined

  emit("clickValue", { corpusIds, cqp })
}

/** Create sub query for a given value row */
function buildExampleCqp(row: SingleRow) {
  const corpora = corpusListing.pick(Object.keys(row.corpora))
  const attrs = corpora.getReduceAttrs()
  const cqpStringifiers = fromKeys(
    props.attributes,
    (attr) => attrs[attr] && getCqpStringifier(attrs[attr]),
  )
  return getRowCqp(row, props.result.ignoreCase, cqpStringifiers)
}

function onDistributionClick(row: Row): void {
  distributionRow.value = row
  distributionDialog?.reveal()
}
</script>

<template>
  <div>
    <div ref="gridEl" style="height: 90svh" />
    <ModalDialog
      :title="t('result.statistics.distributions.title')"
      :size="corpora.length > 10 ? 'lg' : 'md'"
      @setup="distributionDialog = $event"
    >
      <CorpusDistributionChart v-if="distributionRow" :row="distributionRow" />
    </ModalDialog>
  </div>
</template>
