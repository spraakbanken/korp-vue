<script lang="ts" setup>
import { getSeries, type TimeData, type YearSeries } from "@/core/backend/timedata"
import {
  BarElement,
  CategoryScale,
  Chart,
  type ChartDataset,
  LinearScale,
  TimeScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { assignWith, pickBy, range } from "lodash-es"
import { computed } from "vue"
import { Bar } from "vue-chartjs"
import { useI18n } from "vue-i18n"
import { useReactiveCorpusSelection } from "./useReactiveCorpusSelection"
import { useCssVar } from "@vueuse/core"

type Data = Record<number, number | undefined>

const props = defineProps<{
  data: TimeData
}>()

const { t, locale } = useI18n()
const corpusSelection = useReactiveCorpusSelection()
const primaryColor = useCssVar("--bs-primary")
const dangerColor = useCssVar("--bs-danger")
const neutralColor = useCssVar("--bs-secondary-bg")

Chart.register(LinearScale, TimeScale, BarElement, CategoryScale, Tooltip)

const min = props.data.byYear[0][0]
const max = props.data.byYear[props.data.byYear.length - 1][0]

// If there is undated data, add another bar slightly above the max of dated data
const undatedFakeYear = max + Math.max(2, Math.ceil((max - min) / 60))

function getSelectedSeries() {
  // `pickBy` removes zeroes.
  const series = corpusSelection.map((corpus) => ("time" in corpus ? pickBy(corpus.time) : {}))
  // Sum the counts by year for each corpora
  return assignWith<YearSeries>(
    {},
    ...series,
    (sum: number | undefined, value: number) => (sum || 0) + value,
  )
}

function getSelectedUndatedSeries() {
  return corpusSelection.corpora.reduce((sum, corpus) => sum + (corpus["non_time"] || 0), 0)
}

const datasetsDated = computed(() => [
  {
    label: t("corpus.selection.graph.selected"),
    data: getSelectedSeries(),
    backgroundColor: primaryColor.value,
  },
  {
    label: t("corpus.selection.graph.available"),
    data: getSeries(),
    backgroundColor: neutralColor.value,
  },
])

const datasetsUndated = computed<ChartDataset<"bar", Data>[]>(() => [
  {
    label: t("corpus.selection.graph.selected"),
    data: { [undatedFakeYear]: getSelectedUndatedSeries() },
    backgroundColor: dangerColor.value,
  },
  {
    label: t("corpus.selection.graph.available"),
    data: { [undatedFakeYear]: props.data.undated },
    backgroundColor: neutralColor.value,
  },
])

// Labels need to be strings to match with the `{[year]: count}` format of the datasets.
// `max + 1` because `range` excludes end value.
const data = computed<ChartData<"bar", Data>>(() =>
  props.data.undated
    ? {
        labels: range(min, undatedFakeYear + 1).map(String),
        datasets: [...datasetsDated.value, ...datasetsUndated.value],
      }
    : {
        labels: range(min, max + 1).map(String),
        datasets: datasetsDated.value,
      },
)

const options = computed(
  () =>
    <ChartOptions<"bar">>{
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          display: false,
          beginAtZero: true,
        },
        x: {
          ticks: {
            autoSkip: false,
          },
          // Calculate what years to label. Subtract `min` because Chart.js wants the indices, not the labels.
          afterBuildTicks: (axis) =>
            (axis.ticks = calculateYearTicks(min, max).map((v) => ({ value: v - min }))),
        },
      },
      datasets: {
        bar: {
          // Show bars behind each other, not next to.
          grouped: false,
          // Eliminate space between bars
          categoryPercentage: 1.0,
          barPercentage: 1.0,
          // Make low-resource years show more
          minBarLength: 2,
        },
      },
      locale: locale.value,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          caretSize: 0,
          yAlign: "bottom",
          callbacks: {
            title: (items) =>
              Number(items[0].label) < undatedFakeYear
                ? `${t("corpus.selection.graph.year", { year: items[0].label })}`
                : t("corpus.selection.graph.undated"),
          },
          // See `defaults` in https://github.com/chartjs/Chart.js/blob/master/src/plugins/plugin.tooltip.js
          animations: {
            opacity: {
              duration: 100,
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      animation: {
        duration: 0,
      },
    },
)

/**
 * Find some even points within a range of years.
 *
 * E.g: (1830, 2024) => [1850, 1900, 1950, 2000]
 */
function calculateYearTicks(min: number, max: number) {
  // Find a reasonable step size
  const step = [1000, 500, 100, 50, 10, 5].find((i) => i <= (max - min) / 2) || 1
  const round = (year: number) => Math.ceil(year / step) * step
  // `range` excludes end value, which is fine because we used `ceil`
  // `max + 1` to have last year included in case `step` is 1
  return range(round(min), round(max + 1), step)
}
</script>

<template>
  <div class="position-relative" style="height: 5rem; width: 20rem">
    <Bar :data :options />
  </div>
</template>
