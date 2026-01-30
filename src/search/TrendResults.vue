<script setup lang="ts">
import type { Series, TrendTask } from "@/core/task/TrendTask"
import { findOptimalLevel, getTimeCqp, type Level } from "@/core/trend/util"
import type { Moment } from "moment"
import { computed, onMounted, ref } from "vue"
import TrendGraph from "./TrendGraph.vue"
import { compact } from "lodash"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  task: TrendTask
}>()

const { t } = useI18n()
const { createTab } = useDynamicTabs()

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
  const data = await props.task.send(levelNew, from, to, () => {})
  series.value = data.series
  level.value = data.level
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
</script>

<template>
  <TrendGraph v-if="series && level" :series :labels :level @clickPoint="onClickPoint" />
</template>
