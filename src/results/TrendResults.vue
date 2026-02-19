<script setup lang="ts">
import type { Series, TrendTask } from "@/core/task/TrendTask"
import { findOptimalLevel, getTimeCqp, spliceGraphData, type Level } from "@/core/trend/util"
import type { Moment } from "moment"
import { computed, onMounted, ref } from "vue"
import TrendGraph from "./TrendGraph.vue"
import { cloneDeep, compact } from "lodash-es"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useI18n } from "vue-i18n"
import moment from "moment"
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import vFadeIfLoading from "@/components/vFadeIfLoading"

const props = defineProps<{
  task: TrendTask
}>()

const progress = defineModel<number>("progress")

const { t } = useI18n()
const { createTab } = useDynamicTabs()

/** What time span to show in main chart */
const range = ref<{ from: Date; to: Date }>()
const series = ref<Series[]>([])
const level = ref<Level>("year")
const labels = computed(() => Object.fromEntries(props.task.subqueries))

onMounted(() => {
  const interval = props.task.corpusSet.getMomentInterval()
  if (!interval) throw new Error("Time interval missing")
  const [from, to] = interval
  doSearch(from, to)
})

async function doSearch(from: Moment, to: Moment) {
  const levelNew = findOptimalLevel(from, to)
  progress.value = 0

  let data
  try {
    data = await props.task.send(levelNew, from, to, (report) => (progress.value = report.percent))
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    throw error
  }

  setSeries(data.series)
  level.value = data.level
}

/** Ingest new series data */
function setSeries(newSeries: Series[]) {
  // First load
  if (!series.value.length) series.value = newSeries
  // If zooming: base data exists; splice new data into it
  else {
    // Splicing the ref value directly seems to cause an infinite loop.
    const copy = cloneDeep(series.value)
    // TODO Remove unintuitive animation when splicing data
    spliceGraphData(copy, newSeries)
    series.value = copy
  }
}

function onClickPoint(series: Series[], time: Moment) {
  // Build CQP for the selected time interval
  const timeCqp = getTimeCqp(time, level.value)
  // Combine the CQP fragments of the selected series as a disjunction `X | Y`
  const seriesCqps = compact(series.map((serie) => serie.subcqp))
  const seriesCqp = seriesCqps.join(" | ")
  // Open subsearch in new tab
  const cqps = compact([props.task.cqp, seriesCqp, timeCqp])
  const task = new ExampleTask(props.task.corpusSet.getIds(), cqps, props.task.defaultWithin)
  createTab(t("result.kwic"), task)
}

function onSelectRange(from: Date, to: Date) {
  range.value = { from, to }
  doSearch(moment(from), moment(to))
}
</script>

<template>
  <TrendGraph
    v-if="series.length && level"
    :series
    :labels
    :level
    :range
    v-fade-if-loading="progress"
    @clickPoint="onClickPoint"
    @selectRange="onSelectRange"
  />
</template>
