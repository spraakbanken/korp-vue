<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { createStatisticsCsv, getCqp, processStatisticsResult } from "@/core/statistics/statistics"
import { isTotalRow, type Row, type StatisticsProcessed } from "@/core/statistics/statistics.types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { useElementVisibility, watchDeep, watchImmediate, whenever } from "@vueuse/core"
import { computed, ref, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "../useDynamicTabs"
import StatisticsGrid from "./StatisticsGrid.vue"
import { debounce } from "lodash-es"
import StatisticsAttributeSelector, {
  type StatisticsAttributeSelectorModel,
} from "./StatisticsAttributeSelector.vue"
import { storeToRefs } from "pinia"
import HelpBadge from "@/components/HelpBadge.vue"
import { TrendTask } from "@/core/task/TrendTask"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { MapTask } from "@/core/task/MapTask"
import { getGeoAttributes, type MapAttributeOption } from "@/core/statistics/map"
import MapButton from "./MapButton.vue"
import OptionsBar from "@/components/OptionsBar.vue"
import ExportButton from "../ExportButton.vue"
import { locObj } from "@/core/i18n"
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import vFadeIfLoading from "@/components/vFadeIfLoading"
import { useStringifiers } from "@/attributes/useStringifiers"
import { fromKeys } from "@/core/util"

const UPDATE_DELAY_MS = 500

const progress = defineModel<number>("progress")

const store = useAppStore()
const { t } = useI18n()
const { createTab } = useDynamicTabs()
const getStringifier = useStringifiers()

const attributesSelected = ref<StatisticsAttributeSelectorModel>({
  selected: store.stats_reduce.split(","),
  insensitive: store.stats_reduce_insensitive.split(","),
})
let corpusSelectionSearched: CorpusSet | null = null
const containerEl = useTemplateRef("container")
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<StatisticsProcessed>()
const isVisible = useElementVisibility(containerEl)
/** List of map-compatible attributes in the searched corpus set */
const mapAttributes = ref<MapAttributeOption[]>([])
const rowsSelected = ref<Row[]>([])
let withinSearched: string | null = null
const { activeSearch, statsRelative } = storeToRefs(store)

const proxy = new StatsProxy().setProgressHandler((report) => {
  progress.value = report.percent
})

// Enable statistics when opening tab first time
whenever(
  isVisible,
  () => {
    // Start watching search query
    watchImmediate(activeSearch, () => {
      // Initial corpus selection may not have settled yet.
      if (corpusSelection.corpora.length) doSearch()
      else setTimeout(() => doSearch())
    })

    watchDeep(attributesSelected, () => onOptionsChange())
  },
  { once: true, immediate: true },
)

async function doSearch() {
  // Empty search is possible when doing comparison first
  if (!store.activeSearch) return
  proxy.abort()
  corpusSelectionSearched = corpusSelection.pick(corpusSelection.getIds())
  withinSearched = store.within
  const attrs = attributesSelected.value
  const cqpValue = cqp.value
  const ignoreCase = !!attrs.insensitive.length
  progress.value = 0

  let counts
  try {
    counts = await proxy.makeRequest(cqpValue, attrs.selected, withinSearched, ignoreCase)
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    throw error
  }

  const stringifiers = fromKeys(attrs.selected, (name) => {
    const attribute = corpusSelectionSearched?.getReduceAttrs()[name]
    if (!attribute) console.warn("Attribute not found in corpus selection:", name)
    return attribute ? getStringifier(attribute) : String
  })

  data.value = await processStatisticsResult(
    corpusSelectionSearched.stringify(false),
    counts,
    attrs.selected,
    ignoreCase,
    cqpValue,
    stringifiers,
  )

  mapAttributes.value = getGeoAttributes(corpusSelectionSearched.corpora)
}

const onOptionsChange = debounce(() => {
  const { selected, insensitive } = attributesSelected.value
  store.stats_reduce = selected.join()
  store.stats_reduce_insensitive = insensitive.join()
  doSearch()
}, UPDATE_DELAY_MS)

/** Open a dynamic subsearch tab when clicking a frequency value */
function onClickValue(corpusIds: string[], subcqp?: string) {
  // Reuse the main query and add a subquery for the selected row (unless it's the totals row)
  const cqps = [cqp.value]
  if (subcqp) cqps.push(subcqp)

  const within = proxy.getParams().default_within
  const task = new ExampleTask(corpusIds, cqps, within)
  createTab(t("result.kwic"), task)
}

function openTrendTab() {
  const subqueries = getSubqueries()
  const showTotal = rowsSelected.value.some(isTotalRow)

  const task = new TrendTask(
    cqp.value,
    subqueries,
    showTotal,
    corpusSelectionSearched!,
    withinSearched!,
  )
  createTab(t("result.trend"), task)
}

function openMapTab(attribute: MapAttributeOption, relative: boolean) {
  const subqueries = Object.fromEntries(getSubqueries())
  const task = new MapTask(
    cqp.value,
    subqueries,
    attribute.label,
    attribute.corpora,
    withinSearched!,
    relative,
  )
  createTab(t("result.map"), task)
}

function getSubqueries() {
  const ignoreCase = !!attributesSelected.value.insensitive.length

  const subqueries: [string, string][] = []
  for (const row of rowsSelected.value) {
    if (isTotalRow(row)) continue
    const cqp = getCqp(row.statsValues, ignoreCase)
    const label = attributesSelected.value.selected
      .map((attr) => row.formattedValue[attr])
      .join(", ")
    subqueries.push([cqp, label])
  }
  return subqueries
}

function createExport() {
  const corpusTitles = Object.fromEntries(
    corpusSelectionSearched!.corpora.map((corpus) => [corpus.id, locObj(corpus.title)]),
  )

  return createStatisticsCsv(
    data.value!.rows,
    attributesSelected.value.selected,
    corpusTitles,
    statsRelative.value,
    t("result.statistics.total"),
  )
}
</script>

<template>
  <div class="vstack gap-2" ref="container">
    <OptionsBar>
      <label class="d-flex align-items-baseline gap-1">
        {{ $t("result.statistics.group_by") }}:
        <StatisticsAttributeSelector v-model="attributesSelected" />
      </label>

      <label class="form-check-label">
        <input class="form-check-input" type="checkbox" v-model="statsRelative" />
        {{ $t("result.statistics.relative") }}
        <HelpBadge :text="$t('result.statistics.relative.help')" />
      </label>

      <template #end>
        <ExportButton :disabled="!data" name="statistics" :get-rows="createExport" />
      </template>
    </OptionsBar>

    <div class="hstack gap-2 align-items-baseline">
      <!-- Trend chart button -->
      <button type="button" class="btn btn-secondary" :disabled="!data" @click="openTrendTab()">
        {{ $t("result.statistics.trend") }}
      </button>

      <!-- Map button -->
      <MapButton :attributes="mapAttributes" @open="openMapTab" />
    </div>

    <StatisticsGrid
      v-if="data"
      :attributes="attributesSelected.selected"
      :rows="data.rows"
      :params="data.params"
      v-model="rowsSelected"
      v-fade-if-loading="progress"
      @click-value="onClickValue($event.corpusIds, $event.cqp)"
    />
  </div>
</template>
