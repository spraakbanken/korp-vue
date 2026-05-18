<script setup lang="ts">
import { formatDecimals } from "@/core/i18n"
import type { Point, Series } from "@/core/task/TrendTask"
import { FORMATS, type Level } from "@/core/trend/util"
import {
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  type ChartDataset,
} from "chart.js"
import "chartjs-adapter-moment"
import SelectDragPlugin from "@01coder/chartjs-plugin-selectdrag"
import { type Moment } from "moment"
import { computed, reactive, useId, watchEffect } from "vue"
import { Bar, Line } from "vue-chartjs"
import { useI18n } from "vue-i18n"
import { useDark, watchImmediate } from "@vueuse/core"
import { TrendChart } from "./TrendChart"

const props = defineProps<{
  series: Series[]
  level: Level
  range?: { from: Date; to: Date }
  showTotal?: boolean
  type: "line" | "bar"
}>()

const emit = defineEmits<{
  (e: "clickPoint", series: Series[], time: Moment): void
  (e: "selectRange", start: Date, end: Date): void
}>()

const { t, locale } = useI18n()
const id = useId()
const isDark = useDark()

const trendChart = reactive(new TrendChart(props.type, props.level, props.series, props.showTotal))

// Sync props to chart model
watchEffect(() => (trendChart.type = props.type))
watchEffect(() => (trendChart.level = props.level))
watchEffect(() => (trendChart.series = props.series))
watchEffect(() => (trendChart.range = props.range))
watchEffect(() => (trendChart.locale = locale.value))

watchImmediate(isDark, () => {
  // Copy --bs-body-color
  // TODO Use useCssVar()?
  Chart.defaults.color = isDark.value ? "#dee2e6" : "#212529"
})

Chart.register(LinearScale, TimeScale, PointElement, LineElement)

const formatTooltipTitle = (time: Moment) => time.format(FORMATS[props.level])

const formatTooltipItem = (point: Point) => [
  `${t("stat.freq_relative")}: ${formatDecimals(point.y!, 1)}`,
  `${t("stat.freq")}: ${point.absolute!}`,
]

const onClickPoint = (series: Series[], time: Moment) => emit("clickPoint", series, time)

const onSelectRange = (start: Date, end: Date) => emit("selectRange", start, end)

/** Chart.js options for the main chart */
const mainOptions = computed(() =>
  trendChart.getOptions(formatTooltipTitle, formatTooltipItem, onClickPoint),
)

/** Chart.js options for the overview chart */
const overviewOptions = computed(() => trendChart.getOverviewOptions(onSelectRange))

const datasets = computed<ChartDataset<"line" | "bar", Point[]>[]>(() =>
  trendChart.getDatasets(t("result.statistics.total")),
)
</script>

<template>
  <div>
    <!-- 90vh to almost maximize on a small landscape screen, but cap at 3:2 to save readability on portrait -->
    <div
      class="position-relative w-100"
      style="height: 60svh; max-height: 66vw"
      :key="isDark ? 'dark' : 'light'"
    >
      <!-- @vue-expect-error The Bar component expects only the built-in Point data type. -->
      <Bar
        v-if="type == 'bar'"
        :id="`${id}-bar`"
        :options="mainOptions"
        :data="{ datasets }"
        :plugins="[Legend, Tooltip]"
      />
      <!-- @vue-expect-error The Line component expects only the built-in Point data type. -->
      <Line
        v-else
        :id="`${id}-line`"
        :options="mainOptions"
        :data="{ datasets }"
        :plugins="[Legend, Tooltip]"
      />
    </div>

    <!-- Full-span overview for zooming -->
    <div class="mt-4 position-relative w-100" style="height: 5rem" :key="isDark ? 'dark' : 'light'">
      <!-- @vue-expect-error The Line component expects only the built-in Point data type. -->
      <Line
        :id="`${id}-overview`"
        :options="overviewOptions"
        :data="{
          datasets: [{ ...datasets[0], hidden: false, fill: true }],
        }"
        :plugins="[Filler, SelectDragPlugin]"
      />
    </div>
  </div>
</template>
