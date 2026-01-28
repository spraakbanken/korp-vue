<script setup lang="ts">
import type { CountTimeResponse } from "@/core/backend/types/countTime"
import type { TrendTask } from "@/core/task/TrendTask"
import { findOptimalLevel } from "@/core/trend/util"
import type { Moment } from "moment"
import { onMounted, ref } from "vue"

const props = defineProps<{
  task: TrendTask
}>()

const data = ref<CountTimeResponse>()

onMounted(() => {
  const interval = props.task.corpusSet.getMomentInterval()
  if (!interval) throw new Error("Time interval missing")
  const [from, to] = interval
  doSearch(from, to)
})

async function doSearch(from: Moment, to: Moment) {
  const level = findOptimalLevel(from, to)
  data.value = await props.task.send(level, from, to, () => {})
}
</script>

<template>
  {{ data }}
</template>
