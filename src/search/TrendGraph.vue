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
import { type Moment } from "moment"
import { computed, useId } from "vue"
import {  Line } from "vue-chartjs"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  series: Series[]
  labels: Record<string, string>
  level: Level
}>()

const emit = defineEmits<{
  (e: "clickPoint", series: Series[], time: Moment): void
}>()

const { t } = useI18n()
const id = useId()

Chart.register(Colors, Tooltip, Legend, LinearScale, TimeScale, PointElement, LineElement)

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { x: { type: "time" } },
  interaction: {
    mode: "nearest",
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
            `${t("stat.freq_relative")}: ${formatDecimals(point.y!, 1)}`,
            `${t("stat.freq")}: ${point.absolute!}`,
          ]
        },
      },
    },
  },
  onClick: (e, elements) => {
    if (!elements.length) return
    // Look up the series and the time point indicated by the clicked elements
    const series = elements.map((el) => props.series[el.datasetIndex!]!)
    const time = series[0]!.points[elements[0]!.index]!.x
    emit("clickPoint", series, time)
  },
}

const data = computed<ChartData<"line", Point[]>>(() => ({
  datasets: props.series.map((series) => ({
    // TODO HTML in labels is being escaped
    label: series.label ?? t("result.statistics.total"),
    data: series.points,
  })),
}))
</script>

<template>
  <!-- 90vh to almost maximize on a small landscape screen, but cap at 3:2 to save readability on portrait -->
  <div class="position-relative w-100" style="height: 90vh; max-height: 66vw">
    <!-- @vue-expect-error The Line component expects only the built-in Point data type. -->
    <Line :id :options :data />
  </div>
</template>
