<script setup lang="ts">
import type { Point, Series } from "@/core/task/TrendTask"
import type { Level } from "@/core/trend/util"
import {
  Chart,
  Colors,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import "chartjs-adapter-moment"
import { computed, useId } from "vue"
import { Line } from "vue-chartjs"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  series: Series[]
  labels: Record<string, string>
  level: Level
}>()

const { t } = useI18n()
const id = useId()

Chart.register(Colors, Tooltip, Legend, LinearScale, TimeScale, PointElement, LineElement)

const options: ChartOptions<"line"> = {
  scales: { x: { type: "time" } },
}

const data = computed<ChartData<"line", Point[]>>(() => ({
  datasets: props.series.map((series) => ({
    label: series.label ?? t("result.statistics.total"),
    data: series.points,
  })),
}))
</script>

<template>
  <Line :id :options :data />
</template>
