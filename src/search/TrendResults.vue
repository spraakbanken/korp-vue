<script setup lang="ts">
import type { Series, TrendTask } from "@/core/task/TrendTask"
import { findOptimalLevel, type Level } from "@/core/trend/util"
import type { Moment } from "moment"
import { computed, onMounted, ref } from "vue"
import TrendGraph from "./TrendGraph.vue"

const props = defineProps<{
  task: TrendTask
}>()

const series = ref<Series[]>()
const level = ref<Level>()
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
</script>

<template>
  <TrendGraph v-if="series && level" :series :labels :level />
</template>
