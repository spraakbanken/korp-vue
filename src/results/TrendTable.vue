<script lang="ts" setup>
import { formatFrequency } from "@/core/i18n"
import type { AbsRelSeq } from "@/core/statistics/statistics.types"
import type { Series } from "@/core/task/TrendTask"
import { FORMATS, type Level } from "@/core/trend/util"
import { useAppStore } from "@/store/useAppStore"
import { SlickGrid, type Column } from "slickgrid"
import { useTemplateRef, watchEffect } from "vue"
import { useI18n } from "vue-i18n"

export type TableRow = {
  label: string
  data: {
    [time: string]: AbsRelSeq
  }
}

const props = defineProps<{
  series: Series[]
  level: Level
}>()

const store = useAppStore()
const { t } = useI18n()

const gridEl = useTemplateRef("gridEl")

watchEffect(() => {
  if (!gridEl.value) return

  // TODO Is Series covering the whole span? If so, this could be simplified. In either case, it should be documented.
  // TODO Remove last column with `null`
  const rows: TableRow[] = []
  const columnsMap: Record<string, Column> = {}
  for (const seriesRow of props.series) {
    const tableRow: TableRow = { label: seriesRow.label || t("result.statistics.total"), data: {} }
    for (const item of seriesRow.points) {
      const stampformat = FORMATS[props.level]
      const t = item.x.format(stampformat) // this needs to be fixed for other resolutions
      columnsMap[t] = {
        id: t,
        name: t,
        field: "",
        formatter: (row, cell, value, columnDef, dataContext) => {
          const val = dataContext.data[t]
          return val == undefined ? "" : formatFrequency(val, store.statsRelative)
        },
        cssClass: "text-end",
      }
      tableRow.data[t] = [item.absolute, item.y]
    }
    rows.push(tableRow)
  }

  // Sort columns
  const columns: Column<TableRow>[] = [
    {
      id: "hit",
      name: t('result.trend.table.value'),
      field: "label",
      formatter: (row, cell, value) => value || `<span class="opacity-50">—</span>`,
      cssClass: "parameter-column",
    },
  ]
  for (const key of Object.keys(columnsMap).sort()) {
    columns.push(columnsMap[key])
  }

  const grid = new SlickGrid(gridEl.value, rows, columns, {
    autoHeight: true,
    enableCellNavigation: false,
    enableColumnReorder: false,
    enableTextSelectionOnCells: true,
    forceFitColumns: false,
  })
  return grid
})
</script>

<template>
  <div ref="gridEl" />
</template>

<style scoped lang="scss">
/* Copy coloring from statistics table */
:deep(.slick-pane) {
  .parameter-column {
    background-color: #f1f7ff;
  }

  .slick-row:hover .parameter-column {
    background-color: #e6ebff;
  }

  @media (prefers-color-scheme: dark) {
    .parameter-column {
      background-color: #1e3a5f;
    }

    .slick-row:hover .parameter-column {
      background-color: #274e7a;
    }
  }
}
</style>
