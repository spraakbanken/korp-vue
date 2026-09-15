<script setup lang="ts">
import type { Series, TrendTask } from "@/core/task/TrendTask"
import {
  createTrendTableCsv,
  findOptimalLevel,
  getTimeCqp,
  spliceGraphData,
} from "@/core/trend/util"
import { computed, onMounted, reactive, ref, watch } from "vue"
import TrendGraph from "./TrendGraph.vue"
import { cloneDeep, compact } from "lodash-es"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useI18n } from "vue-i18n"
import vFadeIfLoading from "@/components/vFadeIfLoading"
import { useMatomo } from "vue3-matomo"
import { percentage } from "@/core/i18n"
import OptionsBar from "@/components/OptionsBar.vue"
import TrendTable from "./TrendTable.vue"
import ExportButton from "../ExportButton.vue"
import { useAppStore } from "@/store/useAppStore"
import type { Range } from "./TrendChart"
import ErrorBox from "@/components/ErrorBox.vue"
import { useResult } from "../useResult"

const props = defineProps<{
  task: TrendTask
}>()

const progress = defineModel<number>("progress")

const { t } = useI18n()
const store = useAppStore()
const { createTab } = useDynamicTabs()
const matomo = useMatomo()

/** What time span to show in main chart */
const range = ref<Range>()
const reactiveTask = reactive(props.task)
const series = ref<Series[]>([])
const undatedRatio = props.task.corpusSet.getUndatedRatio()
const view = ref<"line" | "bar" | "table">("line")

onMounted(() => {
  loadResult()
  matomo.value?.trackEvent("Trend", "New")
})

async function load() {
  const { from, to } = getRange()
  const levelNew = findOptimalLevel(from, to)
  return await props.task.send(levelNew, from, to, (report) => (progress.value = report.percent))
}

const { data, errorMessage, state, loadResult } = useResult(progress, load, props.task)

const level = computed(() => data.value?.level || "year")

function getRange(): { from: Date; to: Date } {
  if (range.value) return range.value
  else {
    const interval = props.task.corpusSet.getTimeRange()
    if (!interval) throw new Error("Time interval missing")
    const [from, to] = interval
    return { from, to }
  }
}

/** Ingest new series data */
watch(data, () => {
  if (!data.value) {
    // Unset on error
    series.value = []
    return
  } else if (!series.value.length)
    // First load
    series.value = data.value.series
  // If zooming: base data exists; splice new data into it
  else {
    // Splicing the ref value directly seems to cause an infinite loop.
    // Maybe due to conflicts between the Chart.js and Vue reactivity systems.
    const copy = cloneDeep(series.value)
    spliceGraphData(copy, data.value.series)
    series.value = copy
  }
})

function onClickPoint(series: Series[], time: Date) {
  // Build CQP for the selected time interval
  const timeCqp = getTimeCqp(time, level.value)
  // Combine the CQP fragments of the selected series as a disjunction `X | Y`
  const seriesCqps = compact(series.map((serie) => serie.subcqp))
  const seriesCqp = seriesCqps.join(" | ")
  // Open subsearch in new tab
  const cqps = compact([props.task.cqp, seriesCqp, timeCqp])
  const task = new ExampleTask(props.task.corpusSet.getIds(), cqps, props.task.defaultWithin)
  createTab(() => t("result.kwic"), task)
  matomo.value?.trackEvent("Trend", "Subsearch")
}

function onSelectRange(rangeNew?: Range) {
  range.value = rangeNew
  loadResult(true)
  matomo.value?.trackEvent("Trend", "Select range")
}

function createCsv() {
  return createTrendTableCsv(
    series.value,
    level.value,
    store.statsRelative,
    t("result.trend.table.value"),
    t("result.statistics.total"),
  )
}
</script>

<template>
  <div class="vstack gap-2">
    <OptionsBar>
      <div class="hstack gap-2">
        <span id="trend-options-view-label">{{ t("result.trend.view") }}</span>
        <div class="btn-group" role="group" aria-labelledby="#trend-options-view-label">
          <button
            type="button"
            class="btn btn-secondary"
            @click="view = 'line'"
            :class="{ active: view === 'line' }"
          >
            {{ t("result.trend.view.line") }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="view = 'bar'"
            :class="{ active: view === 'bar' }"
          >
            {{ t("result.trend.view.bar") }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="view = 'table'"
            :class="{ active: view === 'table' }"
          >
            {{ t("result.trend.view.table") }}
          </button>
        </div>
      </div>

      <template #end>
        <ExportButton
          :disabled="!series.length"
          name="trend"
          :get-rows="createCsv"
          :json="reactiveTask.response"
          endpoint="count_time"
        />
      </template>
    </OptionsBar>

    <!-- Undated ratio info -->
    <div v-if="undatedRatio > 0" class="alert alert-info">
      <fa-icon icon="fa-solid fa-info-circle" class="me-1" />
      {{ t("result.trend.undated", { ratio: percentage(undatedRatio) }) }}
    </div>

    <TrendGraph
      v-if="(view == 'line' || view == 'bar') && series.length"
      :series
      :level
      :range
      :showTotal="task.showTotal"
      :type="view"
      v-fade-if-loading="progress"
      @clickPoint="onClickPoint"
      @selectRange="onSelectRange"
    />

    <TrendTable v-if="view == 'table'" :series :level />

    <div v-if="state == 'aborted' && !series.length" class="alert alert-warning align-self-center">
      {{ $t("result.aborted") }}
    </div>

    <ErrorBox v-if="errorMessage" v-bind="errorMessage" class="mx-auto mb-0" />
  </div>
</template>
