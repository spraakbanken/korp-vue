import { zip } from "lodash"
import "slickgrid/dist/styles/css/slick.grid.css"
import { isTotalRow, type Dataset, type Row, type SingleRow } from "./statistics.types"
import {
  SlickCheckboxSelectColumn,
  SlickGrid,
  SlickRowSelectionModel,
  type Column,
  type SingleColumnSort,
} from "slickgrid"
import { corpusListing } from "../corpora/corpusListing"
import settings from "../config"
import { formatFrequency, locObj } from "../i18n"
import type { Store } from "../model/store"
import type { LangString } from "../model/locale"

export class StatisticsGrid extends SlickGrid<Row> {
  constructor(
    el: HTMLElement,
    data: Dataset,
    corpusIds: string[],
    attrs: string[],
    readonly store: Store,
    totalsLabel: LangString,
    showPieChart: (row: Row) => void,
    onValueClick: (row: Row, corpusId?: string) => void,
  ) {
    const { columns, checkboxSelector } = createColumns(store, corpusIds, attrs, totalsLabel)

    super(el, data, columns as Column<Row>[], {
      enableCellNavigation: false,
      enableColumnReorder: false,
      forceFitColumns: false,
    })

    this.setSelectionModel(new SlickRowSelectionModel({ selectActiveRow: false }))
    this.registerPlugin(checkboxSelector)
    this.setSelectedRows([0])
    this.autosizeColumns()
    this.refreshColumns()

    this.onSort.subscribe((e, sort) => {
      const { sortCol, sortAsc } = sort as SingleColumnSort

      if (!(sortCol?.field && sortCol.id)) return
      const sorter = getSorter(sortCol.field, sortCol.id, store.lang)

      data.sort((a, b) => {
        // Place totals row first
        if (isTotalRow(a)) return -1
        if (isTotalRow(b)) return 1
        return sorter(a, b) * (sortAsc ? 1 : -1)
      })

      this.setData(data, false)
      this.updateRowCount()
      this.render()
    })

    this.setSortColumn("total", false)

    this.onClick.subscribe((e, args) => {
      const column = this.getColumns()[args.cell] as SlickgridColumn
      const row = this.getDataItem(args.row)
      if (column.id == "pieChart") showPieChart(row)
      else if ((column.field == "hit_value" && !isTotalRow(row)) || column.field == "total")
        onValueClick(row)
      else if (column.field == "count") onValueClick(row, column.id)
    })
  }

  refreshColumns() {
    const columns = this.getColumns() as SlickgridColumn[]
    columns.forEach((column) => {
      if (column.getName) column.name = column.getName(this.store.lang)
    })
    this.setColumns(columns as Column<Row>[])
  }
}

function getSorter(type: string, col: string | number, lang: string): Comparer<SingleRow> {
  const sorters: Record<string, Comparer<SingleRow>> = {
    hit_value: (a, b) =>
      (a.formattedValue[col] || "").localeCompare(b.formattedValue[col] || "", lang),
    total: (a, b) => a.total[0] - b.total[0],
    count: (a, b) => (a.count[col]?.[0] || 0) - (b.count[col]?.[0] || 0),
  }

  return sorters[type] || (() => 0)
}

type Comparer<T> = (a: T, b: T) => number

/** Create SlickGrid column definitions for statistics data. */
function createColumns(
  store: Store,
  corpora: string[],
  attrs: string[],
  totalsLabel: LangString,
): { columns: SlickgridColumn[]; checkboxSelector: SlickCheckboxSelectColumn } {
  const cl = corpusListing.pick(corpora)
  const attributes = cl.getReduceAttrs()
  const labels = attrs.map((name) =>
    name == "word" ? settings["word_label"] : attributes[name]?.label,
  )

  // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
  const getCorpusTitle = (id: string): string =>
    locObj(settings.corpora[id.toLowerCase()]!.title, store.lang)
  corpora.sort((a, b) => getCorpusTitle(a).localeCompare(getCorpusTitle(b), store.lang))

  const checkboxSelector = new SlickCheckboxSelectColumn({
    cssClass: "parameter-column",
  })

  const minWidth = 100
  const dir = settings["dir"] ? `dir="${settings["dir"]}"` : ""
  const columns: SlickgridColumn[] = []

  columns.push(checkboxSelector.getColumnDefinition() as SlickgridColumn)

  for (const [reduceVal, reduceValLabel] of zip(attrs, labels)) {
    if (reduceVal == null || reduceValLabel == null) break
    columns.push({
      id: reduceVal,
      getName: (lang) => locObj(reduceValLabel!, lang),
      field: "hit_value",
      sortable: true,
      formatter: (row, cell, value, columnDef, data: Row) => {
        if (isTotalRow(data)) return "Σ"
        const output = data.formattedValue[reduceVal!] || `<span class="opacity-50">&empty;</span>`
        return `<div data-row="${data.rowId}" ${dir}>${output}</div>`
      },
      minWidth,
      cssClass: "parameter-column value-cell",
    })
  }

  columns.push({
    id: "pieChart",
    name: "",
    field: "hit_value",
    sortable: false,
    formatter: () => `📊`,
    maxWidth: 25,
    minWidth: 25,
    cssClass: "total-column distribution-cell",
  })

  columns.push({
    id: "total",
    getName: (lang) => locObj(totalsLabel, lang),
    field: "total",
    sortable: true,
    defaultSortAsc: false,
    formatter: (row, cell, value) => {
      return formatFrequency(value, store.statsRelative, store.lang)
    },
    minWidth,
    cssClass: "total-column frequency-cell",
  })

  corpora.forEach((id) =>
    columns.push({
      id,
      getName: (lang) => locObj(settings.corpora[id.toLowerCase()]!.title, lang),
      field: "count",
      sortable: true,
      defaultSortAsc: false,
      formatter: (row, cell, value) => {
        return formatFrequency(value[id], store.statsRelative, store.lang)
      },
      minWidth,
      cssClass: "frequency frequency-cell",
    }),
  )

  return { columns, checkboxSelector }
}

/* Slick column enhanced with custom stuff */
type SlickgridColumn = Omit<Column<Row>, "field" | "id"> & {
  field: string
  id: string
  getName?: (lang: string) => string
}
