<script lang="ts" setup>
import { goldenOklch } from "@/core/util"
import { corpusListing } from "@/core/corpora/corpusListing"
import { compareLabels, formatFrequency } from "@/core/i18n"
import type { Row } from "@/core/statistics/statistics.types"
import { useLocale } from "@/i18n/useLocale"
import { ArcElement, Chart, Legend, Tooltip, type ChartData, type ChartOptions } from "chart.js"
import { computed } from "vue"
import { Pie } from "vue-chartjs"
import { useI18n } from "vue-i18n"
import { useTheme } from "@/components/useTheme"

const props = defineProps<{
  row: Row
}>()

const theme = useTheme()
const { locale, t } = useI18n()
const { locObj } = useLocale()

Chart.register(ArcElement, Tooltip, Legend)

// Look up corpus objects and combine with frequencies
const stats = computed(() =>
  Object.entries(props.row.count)
    .map(([id, count]) => ({
      count,
      title: locObj(corpusListing.get(id).title),
    }))
    .sort(compareLabels((item) => item.title)),
)

const data = computed<ChartData<"pie">>(() => {
  const palette = goldenOklch(theme.primary)
  const colors = stats.value.map(() => palette.next().value!)
  return {
    labels: stats.value.map((item) => item.title),
    datasets: [
      // Outer series: absolute frequencies
      {
        data: stats.value.map((item) => item.count[0]),
        backgroundColor: colors,
        label: t("stat.freq"),
      },
      // Inner series: relative frequencies
      {
        data: stats.value.map((item) => item.count[1]),
        backgroundColor: colors.map((c) => `color-mix(${c}, white 40%)`),
        label: t("stat.freq_relative"),
      },
    ],
  }
})

const options = computed<ChartOptions<"pie">>(() => ({
  plugins: {
    legend: {
      position: "bottom",
    },
    // See https://www.chartjs.org/docs/latest/configuration/tooltip.html
    tooltip: {
      callbacks: {
        label: (item) => {
          const isRelative = item.datasetIndex == 1
          const absrel = stats.value[item.dataIndex]!.count
          const formatted = formatFrequency(absrel, isRelative, locale.value)
          return `${item.dataset.label}: ${formatted}`
        },
      },
    },
  },
}))
</script>

<template>
  <div>
    <Pie :data :options />
  </div>
</template>
