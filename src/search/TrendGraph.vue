<script setup lang="ts">
import { formatDecimals } from "@/core/i18n"
import type { Point, Series } from "@/core/task/TrendTask"
import { FORMATS, type Level } from "@/core/trend/util"
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

// TODO Show relative+absolute frequencies on hover
const options: ChartOptions<"line"> = {
  responsive: true,
  scales: { x: { type: "time" } },
  interaction: {
    mode: "nearest",
    axis: "xy",
    intersect: false,
  },
  plugins: {
    tooltip: {
      callbacks: {
        // Format date in tooltip
        title: (items) => (items[0]!.raw as Point).x.format(FORMATS[props.level]),
        label: (item) => {
          const point = item.raw as Point
          return [
            `${t("stat.freq_relative")}: ${formatDecimals(point.y, 1)}`,
            `${t("stat.freq")}: ${point.absolute}`,
          ]
        },
      },
    },
  },
}

const data = computed<ChartData<"line", Point[]>>(() => ({
  datasets: props.series.map((series) => ({
    label: series.label ?? t("result.statistics.total"),
    data: series.points,
  })),
}))
</script>

<template>
  <!-- TODO Does not grow when window resizes -->
  <div class="position-relative w-100">
    <Line :id :options :data />
  </div>
</template>
