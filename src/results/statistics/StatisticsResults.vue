<script setup lang="ts">
import { NoSupportedCorporaError, StatsProxy } from "@/core/backend/proxy/StatsProxy"
import { createStatisticsCsv, getCqp, processStatisticsResult } from "@/core/statistics/statistics"
import { isTotalRow, type Row } from "@/core/statistics/statistics.types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "../useDynamicTabs"
import StatisticsGrid from "./StatisticsGrid.vue"
import { debounce, isEqual } from "lodash-es"
import StatisticsAttributeSelector from "./StatisticsAttributeSelector.vue"
import { storeToRefs } from "pinia"
import HelpBadge from "@/components/HelpBadge.vue"
import { TrendTask } from "@/core/task/TrendTask"
import { MapTask } from "@/core/task/MapTask"
import { type MapAttributeOption } from "@/core/statistics/map"
import MapButton from "./MapButton.vue"
import OptionsBar from "@/components/OptionsBar.vue"
import ExportButton from "../ExportButton.vue"
import { locObj, percentage } from "@/core/i18n"
import { useStringifiers } from "@/attributes/useStringifiers"
import { fromKeys } from "@/core/util"
import settings from "@/core/config"
import type { CountResponse } from "@/core/backend/types/count"
import useSearchStore from "@/search/useSearchStore"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { useMatomo } from "vue3-matomo"
import { useResult } from "../useResult"
import ResultsDisplay from "../ResultsDisplay.vue"

const UPDATE_DELAY_MS = 500

const progress = defineModel<number>("progress")

const store = useAppStore()
const { stats_reduce, stats_reduce_insensitive } = storeToRefs(store)
const { t } = useI18n()
const { createTab } = useDynamicTabs()
const { activeSearch } = storeToRefs(useSearchStore())
const getStringifier = useStringifiers()
const matomo = useMatomo()

const cqp = computed(() => activeSearch.value?.cqp || "[]")
const isLimited = ref(false)
const unsupportedRatio = ref(0)
const unsupportedAttributes = ref<AttributeOption[]>([])
const rawResponse = ref<CountResponse>()
const rowsSelected = ref<Row[]>([])
let withinSearched: string | null = null
const { statsRelative } = storeToRefs(store)

const proxy = new StatsProxy().setProgressHandler((report) => {
  progress.value = report.percent
})

/** Number of statistics rows except the totals row */
const rowCount = computed(() => data.value && data.value.rows.length - 1)

onMounted(() => matomo.value?.trackEvent("Statistics", "Activate"))

/** Whether searched material is dated */
const isDated = computed(() => !!activeSearch.value?.corpora.getYearRange())

async function load() {
  // Empty search is possible when doing comparison first
  if (!activeSearch.value) return
  const corpora = activeSearch.value.corpora
  withinSearched = store.within
  const attrs = stats_reduce.value
  const ignoreCase = !!stats_reduce_insensitive.value.length

  // Statistics does not support parallel queries
  const cqpValue = settings.parallel ? cqp.value.replace(/\:LINKED_CORPUS.*/, "") : cqp.value

  const counts = await proxy.makeRequest(cqpValue, attrs, withinSearched, ignoreCase)

  const stringifiers = fromKeys(attrs, (name) => {
    const attribute = corpora.getReduceAttrs()[name]
    return attribute ? getStringifier(attribute) : String
  })

  const result = await processStatisticsResult(
    corpora.stringify(false),
    counts,
    attrs,
    ignoreCase,
    cqpValue,
    stringifiers,
  )

  rawResponse.value = proxy.getResponse()
  isLimited.value = !!settings["statistics_limit"] && counts.combined.rows.length < counts.count
  unsupportedRatio.value = proxy.unsupportedRatio
  unsupportedAttributes.value = proxy.unsupportedAttributes

  return result
}

function onError(error: unknown) {
  if (error instanceof NoSupportedCorporaError) return t("result.statistics.no_supported_corpora")
  return error
}

const { data, loadResult } = useResult(progress, load, proxy, onError)

// Start watching search query
watchImmediate(activeSearch, () => loadResult())

watch([stats_reduce, stats_reduce_insensitive], (valuesNew, valuesOld) => {
  if (!isEqual(valuesNew, valuesOld)) onOptionsChange()
})

const onOptionsChange = debounce(() => loadResult(true), UPDATE_DELAY_MS)

/** Open a dynamic subsearch tab when clicking a frequency value */
function onClickValue(corpusIds: string[], subcqp?: string) {
  // Reuse the main query and add a subquery for the selected row (unless it's the totals row)
  const cqps = [cqp.value]
  if (subcqp) cqps.push(subcqp)

  const within = proxy.getParams()?.default_within
  const task = new ExampleTask(corpusIds, cqps, within)
  createTab(() => t("result.kwic"), task)
  matomo.value?.trackEvent("Statistics", "Subsearch")
}

function openTrendTab() {
  const subqueries = getSubqueries()
  const showTotal = rowsSelected.value.some(isTotalRow)

  const task = new TrendTask(
    cqp.value,
    subqueries,
    showTotal,
    activeSearch.value!.corpora,
    withinSearched!,
  )
  createTab(() => t("result.trend"), task)
}

function openMapTab(attribute: MapAttributeOption, relative: boolean) {
  const subqueries = Object.fromEntries(getSubqueries())
  const task = new MapTask(
    cqp.value,
    subqueries,
    attribute.name,
    attribute.corpora,
    withinSearched!,
    relative,
  )
  createTab(() => t("result.map"), task)
}

function getSubqueries() {
  const ignoreCase = !!stats_reduce_insensitive.value.length

  const subqueries: [string, string][] = []
  for (const row of rowsSelected.value) {
    if (isTotalRow(row)) continue
    const cqp = getCqp(row.statsValues, ignoreCase)
    const label = stats_reduce.value.map((attr) => row.formattedValue[attr]).join(", ")
    subqueries.push([cqp, label])
  }
  return subqueries
}

function createExport() {
  const corpusTitles = Object.fromEntries(
    activeSearch.value!.corpora.corpora.map((corpus) => [corpus.id, locObj(corpus.title)]),
  )

  return createStatisticsCsv(
    data.value!.rows,
    stats_reduce.value,
    corpusTitles,
    statsRelative.value,
    t("result.statistics.total"),
  )
}

watch(rowsSelected, () => matomo.value?.trackEvent("Statistics", "Change row selection"))
</script>

<template>
  <div class="vstack gap-2">
    <OptionsBar>
      <label class="d-flex align-items-baseline gap-1">
        {{ $t("result.statistics.group_by") }}:
        <StatisticsAttributeSelector
          v-model="stats_reduce"
          v-model:insensitive="stats_reduce_insensitive"
        />
      </label>

      <label class="form-check-label">
        <input class="form-check-input" type="checkbox" v-model="statsRelative" />
        {{ $t("result.statistics.relative") }}
        <HelpBadge :text="$t('result.statistics.relative.help')" />
      </label>

      <template #end>
        <ExportButton
          :disabled="!data"
          name="statistics"
          :get-rows="createExport"
          :json="rawResponse"
          endpoint="count"
        />
      </template>
    </OptionsBar>

    <ResultsDisplay :populated="!!rowCount">
      <div class="hstack gap-2 align-items-baseline">
        <!-- Trend chart button -->
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="!isDated || !rowsSelected.length"
          @click="openTrendTab()"
        >
          <fa-icon icon="fa-solid fa-chart-line" />
          {{ $t("result.statistics.trend") }}
        </button>

        <!-- Map button -->
        <MapButton
          v-if="settings.map_enabled"
          :disabled="!rowsSelected.length"
          @open="openMapTab"
        />
      </div>

      <div>
        <!-- Do not count the totals row -->
        {{ $t("result.statistics.row_count", { count: $n(rowCount!) }, rowCount!) }}

        <span v-if="isLimited">
          {{ $t("result.statistics.row_count.limited") }}
          <HelpBadge :text="$t('result.statistics.row_count.limited.help')" />
        </span>
      </div>

      <div v-if="unsupportedRatio" class="alert alert-info my-0">
        <fa-icon icon="fa-solid fa-info-circle" class="me-1" />
        <i18n-t
          scope="global"
          keypath="result.statistics.unsupported_attributes.warning"
          :plural="unsupportedAttributes.length"
        >
          <template #ratio>{{ percentage(unsupportedRatio) }}</template>
          <template #attributes>
            <em>{{ unsupportedAttributes.map((attr) => locObj(attr.label)).join(", ") }}</em>
          </template>
        </i18n-t>
      </div>

      <StatisticsGrid
        v-if="data"
        :attributes="stats_reduce"
        :rows="data.rows"
        :params="data.params"
        v-model="rowsSelected"
        @click-value="onClickValue($event.corpusIds, $event.cqp)"
      />
    </ResultsDisplay>
  </div>
</template>
