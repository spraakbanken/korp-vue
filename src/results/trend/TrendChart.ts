import { GoldenAnglePaletteHsl } from "@/core/color"
import type { Point, Series } from "@/core/task/TrendTask"
import type { Level } from "@/core/trend/util"
import { Interaction, type ChartDataset, type ChartOptions } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import { merge } from "lodash-es"
import type { Moment } from "moment"

export type ChartType = "line" | "bar"

export type Range = { from: Date; to: Date }

/** Custom interaction mode: find nearest vertical, and then the nearest y value along that line. */
Interaction.modes.xnearest = function (chart, e, options, useFinalPosition) {
  // Use the standard "x" mode to find the nearest vertical line of points
  const items = Interaction.modes.x(chart, e, options, useFinalPosition)

  // Get distance of each point, find the minimum distance and pick those items
  const y = getRelativePosition(e, chart).y
  const distances = items.map((item) => Math.abs(item.element.y - y))
  const minDistance = Math.min(...distances)
  return items.filter((item, i) => distances[i] == minDistance)
}

/** Prepares trend chart options/data for Chart.js */
export class TrendChart {
  /** Whether each series is enabled */
  enabled: boolean[]
  locale?: string
  /** Current zoom range */
  range?: Range

  constructor(
    /** Chart type: line or bars */
    public type: ChartType,
    /** Time step granularity */
    public level: Level,
    /** Frequency-over-time data */
    public series: Series[],
    /** Whether to show the totals series by default */
    public showTotal: boolean,
  ) {
    this.enabled = this.getSeries().map(() => true)
  }

  /** Get series to show – hide totals unless it is the only one */
  getSeries(): Series[] {
    return this.series.slice(this.series.length > 1 ? 1 : 0)
  }

  /** Create Chart.js datasets for the active series. */
  getDatasets(totalLabel = ""): ChartDataset<ChartType, Point[]>[] {
    const palette = new GoldenAnglePaletteHsl()
    return this.getSeries().map((series, i) => {
      const color = palette.shift()
      return {
        label: series.label ?? totalLabel,
        data: series.points,
        borderColor: color,
        backgroundColor: color,
        hidden: !this.enabled[i],
      }
    })
  }

  /** Get options common to main and overview */
  getBaseOptions(): ChartOptions<ChartType> {
    return {
      // Animation is unintuitive when zooming, points are shifted horizontally
      animation: false,
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
  getOverviewOptions(onSelectRange: (range?: Range) => void): ChartOptions<ChartType> {
    /** The type of event passed to `onSelectComplete` */
    type SelectDragEvent = {
      /** Selection start and end points as Unix ms timestamps */
      range: [number, number]
    }

    const onSelectComplete = (event: SelectDragEvent): void => {
      // If clicked and not dragged, reset to full range
      // TODO Remove the SelectDragPlugin selection
      if (event.range[0] == event.range[1]) {
        // Only if a range is set
        if (this.range) onSelectRange(undefined)
        return
      }

      const from = new Date(event.range[0])
      const to = new Date(event.range[1])
      onSelectRange({ from, to })
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
          colors: {
            // --bs-primary-bg-subtle
            selection: "#fcded1",
          },
          onSelectComplete,
        },
        tooltip: false,
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
        // Use custom interaction mode
        mode: "xnearest",
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
        const series = elements.map((el) => this.getSeries()[el.datasetIndex!]!)
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

  setEnabled(enabled: boolean[]): void {
    this.enabled = [...enabled]
  }
}
