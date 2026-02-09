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
import { Line } from "vue-chartjs"
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

/** Chart.js options for both main and overview charts */
// TODO Localize thousands separators
const baseOptions: ChartOptions<"line"> = {
  // See https://www.chartjs.org/docs/latest/configuration/responsive.html
  responsive: true,
  maintainAspectRatio: false,
  // See https://www.chartjs.org/docs/latest/axes/cartesian/time.html
  scales: { x: { type: "time" } },
  // See https://www.chartjs.org/docs/latest/configuration/elements.html
  elements: {
    point: { pointStyle: false },
  },
}

/** Chart.js options for the main chart */
const mainOptions: ChartOptions<"line"> = {
  ...baseOptions,
  // See https://www.chartjs.org/docs/latest/configuration/interactions.html
  interaction: {
    // TODO Select nearest single point at nearest X value. I think we need a custom interation mode for that,
    //   see https://www.chartjs.org/docs/latest/configuration/interactions.html#custom-interaction-modes
    mode: "nearest",
    intersect: false,
  },
  plugins: {
    // See https://www.chartjs.org/docs/latest/configuration/tooltip.html
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
  // See https://www.chartjs.org/docs/latest/configuration/interactions.html
  onClick: (e, elements) => {
    if (!elements.length) return
    // Look up the series and the time point indicated by the clicked elements
    const series = elements.map((el) => props.series[el.datasetIndex!]!)
    const time = series[0]!.points[elements[0]!.index]!.x
    emit("clickPoint", series, time)
  },
}

/** Chart.js options for the overview chart */
const overviewOptions: ChartOptions<"line"> = {
  ...baseOptions,
  scales: {
    ...baseOptions.scales,
    // Hide y-axis ticks, but take up place to match with main chart
    y: { ticks: { color: "transparent" } },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
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
    <Line :id="`${id}-main`" :options="mainOptions" :data />
  </div>

  <!-- Full-span overview for zooming -->
  <div class="mt-4 position-relative w-100" style="height: 5rem">
    <!-- @vue-expect-error The Line component expects only the built-in Point data type. -->
    <Line :id="`${id}-overview`" :options="overviewOptions" :data />
  </div>
</template>
