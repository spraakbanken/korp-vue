import { zip } from "lodash-es"
import "slickgrid/dist/styles/css/slick.grid.css"
import { isTotalRow, type Row, type SingleRow } from "./statistics.types"
import {
  SlickCheckboxSelectColumn,
  SlickGrid,
  SlickRowSelectionModel,
  type Column,
  type SingleColumnSort,
} from "slickgrid"
import { corpusListing } from "../corpora/corpusListing"
import settings from "../config"
import { compareLabels, formatFrequency, locObj } from "../i18n"
import type { LangString } from "../model/locale"
import { icon } from "@fortawesome/fontawesome-svg-core"
import { faChartPie } from "@fortawesome/free-solid-svg-icons"
import type { ListStringifier, Stringifier } from "@/core/corpora/attributes.types"
import { stringifyValues } from "../corpora/attribute"

export class StatisticsGrid extends SlickGrid<Row> {
  constructor(
    el: HTMLElement,
    data: Row[],
    corpusIds: string[],
    attrs: string[],
    stringifiers: Record<string, { token: Stringifier; list?: ListStringifier }>,
    totalsLabel: LangString,
    protected getLang: () => string,
    getRelative: () => boolean,
    setSelectedRows: (rows: Row[]) => void,
    showPieChart: (row: Row) => void,
    onValueClick: (row: Row, corpusId?: string) => void,
  ) {
    const { columns, checkboxSelector } = createColumns(
      corpusIds,
      attrs,
      stringifiers,
      totalsLabel,
      getLang,
      getRelative,
    )

    super(el, data, columns as Column<Row>[], {
      enableCellNavigation: false,
      enableColumnReorder: false,
      // forceFitColumns would prevent manual resizing;
      // instead, call this.resize() when container size may have changed
    })

    this.setSelectionModel(new SlickRowSelectionModel({ selectActiveRow: false }))
    this.registerPlugin(checkboxSelector)
    this.onSelectedRowsChanged.subscribe((event, args) =>
      setSelectedRows(args.rows.map((i) => this.getDataItem(i))),
    )
    this.setSelectedRows([0])
    this.resize()
    this.refreshColumns()

    this.onSort.subscribe((e, sort) => {
      const { sortCol, sortAsc } = sort as SingleColumnSort

      if (!(sortCol?.field && sortCol.id)) return
      const sorter = getSorter(sortCol.field, sortCol.id)

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

    function getSorter(type: string, col: string | number): (a: SingleRow, b: SingleRow) => number {
      if (type == "hit_value") {
        // Compare by stringified values – potentially heavy
        const { token, list } = stringifiers[col] || {}
        return compareLabels((row) => stringifyValues(row.value[col], token, list))
      }
      if (type == "total") return (a, b) => a.combined.absolute - b.combined.absolute
      if (type == "count")
        return (a, b) => (a.corpora[col]?.absolute || 0) - (b.corpora[col]?.absolute || 0)
      return () => 0
    }

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
      if (column.getName) column.name = column.toolTip = column.getName(this.getLang())
    })
    this.setColumns(columns as Column<Row>[])
  }

  /** Autosize columns */
  resize() {
    this.resizeCanvas()
    this.autosizeColumns()
  }
}

/** Create SlickGrid column definitions for statistics data. */
function createColumns(
  corpora: string[],
  attrs: string[],
  stringifiers: Record<string, { token: Stringifier; list?: ListStringifier }>,
  totalsLabel: LangString,
  getLang: () => string,
  getRelative: () => boolean,
): { columns: SlickgridColumn[]; checkboxSelector: SlickCheckboxSelectColumn } {
  const cl = corpusListing.pick(corpora)
  const attributes = cl.getReduceAttrs()
  const labels = attrs.map((name) =>
    name == "word" ? settings["word_label"] : attributes[name]?.label,
  )

  // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
  corpora.sort(compareLabels((id) => locObj(settings.corpora[id].title)))

  const minWidth = 100
  const columns: SlickgridColumn[] = []

  const checkboxSelector = new SlickCheckboxSelectColumn({})
  const checkboxColumn = checkboxSelector.getColumnDefinition() as SlickgridColumn
  columns.push({
    ...checkboxColumn,
    cssClass: "parameter-column text-center",
    headerCssClass: "parameter-column text-center",
  })

  for (const [reduceVal, reduceValLabel] of zip(attrs, labels)) {
    if (reduceVal == null || reduceValLabel == null) break
    columns.push({
      id: reduceVal,
      getName: (lang) => locObj(reduceValLabel!, lang),
      field: "hit_value",
      sortable: true,
      formatter: (row, cell, value, columnDef, data: Row) => {
        if (isTotalRow(data)) return "Σ"
        const { token, list } = stringifiers[reduceVal] || {}
        const output = stringifyValues(data.value[reduceVal], token, list)
        return settings.dir ? `<div dir="${settings.dir}">${output}</div>` : output
      },
      minWidth,
      cssClass: "parameter-column link",
      headerCssClass: "parameter-column",
    })
  }

  /** SVG string of pie-chart icon */
  const chartIconHtml = icon(faChartPie).html.join("")

  if (corpora.length > 1)
    columns.push({
      id: "pieChart",
      name: "",
      field: "hit_value",
      sortable: false,
      formatter: () => chartIconHtml,
      maxWidth: 25,
      minWidth: 25,
      cssClass: "total-column link",
      headerCssClass: "total-column",
    })

  columns.push({
    id: "total",
    getName: (lang) => locObj(totalsLabel, lang),
    field: "total",
    sortable: true,
    defaultSortAsc: false,
    formatter: (row, cell, value, columnDef, dataContext) => {
      return formatFrequency(dataContext.combined, getRelative(), getLang())
    },
    minWidth,
    cssClass: "total-column text-right link",
    headerCssClass: "total-column text-right",
  })

  corpora.forEach((id) =>
    columns.push({
      id,
      getName: (lang) => locObj(settings.corpora[id]!.title, lang),
      field: "count",
      sortable: true,
      defaultSortAsc: false,
      formatter: (row, cell, value, columnDef, dataContext) => {
        return formatFrequency(dataContext.corpora[id], getRelative(), getLang())
      },
      minWidth,
      cssClass: "text-right link",
      headerCssClass: "text-right",
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
