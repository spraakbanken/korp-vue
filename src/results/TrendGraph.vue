<script setup lang="ts">
import { formatDecimals } from "@/core/i18n"
import type { Point, Series } from "@/core/task/TrendTask"
import { FORMATS, type Level } from "@/core/trend/util"
import {
  Chart,
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
import SelectDragPlugin from "@01coder/chartjs-plugin-selectdrag"
import { type Moment } from "moment"
import { computed, useId } from "vue"
import { Line } from "vue-chartjs"
import { useI18n } from "vue-i18n"
import { cloneDeep, merge } from "lodash-es"
import { GoldenAnglePaletteHsl } from "@/core/color"

const props = defineProps<{
  series: Series[]
  labels: Record<string, string>
  level: Level
  range?: { from: Date; to: Date }
}>()

const emit = defineEmits<{
  (e: "clickPoint", series: Series[], time: Moment): void
  (e: "selectRange", start: Date, end: Date): void
}>()

const { t } = useI18n()
const id = useId()

Chart.register(LinearScale, TimeScale, PointElement, LineElement)

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
const mainOptions = computed(() =>
  merge(cloneDeep(baseOptions), <ChartOptions<"line">>{
    scales: {
      x: {
        min: props.range?.from.getTime(),
        max: props.range?.to.getTime(),
      },
    },
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
  }),
)

/** Chart.js options for the overview chart */
const overviewOptions = merge(cloneDeep(baseOptions), <ChartOptions<"line">>{
  scales: {
    // Hide y-axis ticks, but take up place to match with main chart
    y: { ticks: { color: "transparent" } },
  },
  plugins: {
    selectdrag: {
      enabled: true,
      output: "value",
      highlight: false,
      // Note: Getting uncaught exceptions "TypeError: Cannot read properties of null (reading 'ownerDocument')" – broken destroy handler?
      // TODO Reset selecting on non-drag click
      onSelectComplete(event: SelectDragEvent): void {
        const start = new Date(event.range[0])
        const end = new Date(event.range[1])
        emit("selectRange", start, end)
      },
    },
  },
})

const data = computed<ChartData<"line", Point[]>>(() => {
  const palette = new GoldenAnglePaletteHsl()
  return {
    datasets: props.series.map((series) => {
      const color = palette.shift()
      return {
        // TODO HTML in labels is being escaped
        label: series.label ?? t("result.statistics.total"),
        data: series.points,
        borderColor: color,
        backgroundColor: color,
      }
    }),
  }
})

/** The type of event passed to `onSelectComplete` */
type SelectDragEvent = {
  /** Selection start and end points as Unix ms timestamps */
  range: [number, number]
}
</script>

<template>
  <!-- 90vh to almost maximize on a small landscape screen, but cap at 3:2 to save readability on portrait -->
  <div class="position-relative w-100" style="height: 90svh; max-height: 66vw">
    <!-- @vue-expect-error The Line component expects only the built-in Point data type. -->
    <Line :id="`${id}-main`" :options="mainOptions" :data :plugins="[Legend, Tooltip]" />
  </div>

  <!-- Full-span overview for zooming -->
  <div class="mt-4 position-relative w-100" style="height: 5rem">
    <!-- @vue-expect-error The Line component expects only the built-in Point data type. -->
    <Line :id="`${id}-overview`" :options="overviewOptions" :data :plugins="[SelectDragPlugin]" />
  </div>
</template>
