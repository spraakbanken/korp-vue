import { GoldenAnglePaletteHsl } from "@/core/color"
import type { Point, Series } from "@/core/task/TrendTask"
import type { Level } from "@/core/trend/util"
import type { ChartDataset, ChartOptions } from "chart.js"
import { merge } from "lodash-es"
import type { Moment } from "moment"

export type ChartType = "line" | "bar"

/** Prepares trend chart options/data for Chart.js */
export class TrendChart {
  locale?: string
  /** Current zoom range */
  range?: { from: Date; to: Date }

  constructor(
    /** Chart type: line or bars */
    public type: ChartType,
    /** Time step granularity */
    public level: Level,
    /** Frequency-over-time data */
    public series: Series[],
    /** Whether to show the totals series by default */
    public showTotal: boolean,
  ) {}

  /** Create Chart.js datasets for the active series. */
  getDatasets(totalLabel = ""): ChartDataset<ChartType, Point[]>[] {
    const palette = new GoldenAnglePaletteHsl()
    return this.series.map((series, i) => {
      const color = palette.shift()
      const hideTotals = this.type == "bar" && this.series.length > 1
      return {
        // TODO HTML in labels is being escaped
        label: series.label ?? totalLabel,
        data: series.points,
        borderColor: color,
        backgroundColor: color,
        // Stack totals bars separately
        stack: i > 0 ? "default" : "totals",
        // Hide totals bars by default
        hidden: (i == 0 && !this.showTotal) || hideTotals,
      }
    })
  }

  /** Get options common to main and overview */
  getBaseOptions(): ChartOptions<ChartType> {
    return {
      locale: this.locale,
      // See https://www.chartjs.org/docs/latest/configuration/responsive.html
      responsive: true,
      maintainAspectRatio: false,
      // See https://www.chartjs.org/docs/latest/axes/cartesian/time.html
      scales: { x: { type: "time" } },
      // See https://www.chartjs.org/docs/latest/configuration/elements.html
      elements: {
        // line: { tension: 0.1 },
        point: {
          // Point elements are needed for single timestamps surrounded by missing data,
          // because lines by themselves are not drawn then.
          radius: 1,
        },
      },
    }
  }

  /** Get options for the zoomable overview chart */
  getOverviewOptions(onSelectRange: (start: Date, end: Date) => void): ChartOptions<ChartType> {
    /** The type of event passed to `onSelectComplete` */
    type SelectDragEvent = {
      /** Selection start and end points as Unix ms timestamps */
      range: [number, number]
    }

    return merge(this.getBaseOptions(), {
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
            onSelectRange(start, end)
          },
        },
      },
    })
  }

  /** Get options for the main line/bar chart */
  getOptions(
    formatTooltipTitle: (time: Moment) => string,
    formatTooltipItem: (point: Point) => string[],
    onClickPoint: (series: Series[], time: Moment) => void,
  ): ChartOptions<ChartType> {
    const options = merge(this.getBaseOptions(), <ChartOptions<ChartType>>{
      scales: { x: { min: this.range?.from.getTime(), max: this.range?.to.getTime() } },
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
            title: (items) => formatTooltipTitle((items[0]!.raw as Point).x),
            label: (item) => formatTooltipItem(item.raw as Point),
          },
        },
      },
      // See https://www.chartjs.org/docs/latest/configuration/interactions.html
      onClick: (e, elements) => {
        if (!elements.length) return

        // Look up the series and the time point indicated by the clicked elements
        const series = elements.map((el) => this.series[el.datasetIndex!]!)
        const time = series[0]!.points[elements[0]!.index]!.x
        onClickPoint(series, time)
      },
    })

    // Bar-specific options
    if (this.type == "bar")
      merge(options, {
        scales: {
          x: { stacked: true },
          y: { stacked: true },
        },
      })

    return options
  }
}
