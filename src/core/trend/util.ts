import { last, maxBy, minBy, sortedIndexOf } from "lodash-es"
import type { Moment } from "moment"
import type { Granularity } from "../backend/types"
import moment from "moment"
import type { Point, Series } from "../task/TrendTask"

// TODO Remove unused things after Vue port is done

// export type Series = {
//   data: SeriesPoint[]
//   abs_data: SeriesPoint[]
//   color: string
//   name: string
//   cqp: string
//   emptyIntervals?: SeriesPoint[][]
// }

// export type SeriesPoint = {
//   /** Unix timestamp */
//   x: number
//   y: number
//   zoom: Level
// }

export type Level = "year" | "month" | "day" | "hour" | "minute" | "second"

/**
 * Mapping from long to short form of granularities.
 * Moment uses the long form, and Korp API uses the short form.
 */
export const GRANULARITIES: Record<Level, Granularity> = {
  year: "y",
  month: "m",
  day: "d",
  hour: "h",
  minute: "n",
  second: "s",
}

/** Granularities by descending size order */
export const LEVELS: Level[] = ["year", "month", "day", "hour", "minute", "second"]

/** How to express dates of different granularities */
export const FORMATS: Record<Level, string> = {
  // TODO Localize with Moment locales or toLocaleDateString()
  second: "YYYY-MM-DD hh:mm:ss",
  minute: "YYYY-MM-DD hh:mm",
  hour: "YYYY-MM-DD hh:00",
  day: "YYYY-MM-DD",
  month: "YYYY-MM",
  year: "YYYY",
}

/** Timestamps come from backend in these shapes */
const PARSE_FORMATS: Record<Level, string> = {
  second: "YYYYMMDDHHmmss",
  minute: "YYYYMMDDHHmm",
  hour: "YYYYMMDDHH",
  day: "YYYYMMDD",
  month: "YYYYMM",
  year: "YYYY",
}

export const PALETTE = [
  "#ca472f",
  "#0b84a5",
  "#f6c85f",
  "#9dd866",
  "#ffa056",
  "#8dddd0",
  "#df9eaa",
  "#6f4e7c",
  "#544e4d",
  "#0e6e16",
  "#975686",
]

/** Find a date granularity level that gives a good number of time units in a given range. */
export function findOptimalLevel(from: Moment, to: Moment): Level {
  // Preferred number of x points in a graph (less is uninformative, more is messy)
  const idealPoints = 1000
  // Find what granularity (years, months etc) gives us closest to the ideal number of points
  // E.g. between 1900 and 2000, use months.
  return minBy(LEVELS, (level) => {
    const points = to.diff(from, level)
    return Math.abs(idealPoints - points)
  })!
}

/** Fill missing time units with the value of the last previous count. */
export function fillMissingDate(data: Point[], level: Level): Point[] {
  const dateArray = data.map((point) => point.x)
  // Round range boundaries, e.g. [June 5, Sep 18] => [June 1, Sep 30]
  const min = minBy(dateArray)?.startOf(level)
  const max = maxBy(dateArray)?.endOf(level)
  if (!min || !max) return data

  // Convert tuple list to map to enable lookup
  const dataMap: Record<number, Point> = Object.fromEntries(
    data.map((point) => [point.x.startOf(level).unix(), point]),
  )

  // Step through the range and fill in missing timestamps
  /** Copied counts for unseen timestamps in the range */
  const newPoints: Point[] = []
  let lastPoint: Point | null = null
  for (let t = min.clone(); t <= max; t.add(1, level)) {
    // Get point at timestep
    const point = dataMap[t.unix()]
    // If this timestamp has been counted, don't fill this timestamp but remember the count
    // Distinguish between null (no text at timestamp) and undefined (timestamp has not been counted)
    if (point) lastPoint = point
    // If there's no count here, fill this timestamp with the last seen count
    else newPoints.push({ ...lastPoint!, x: t.clone() })
  }

  // Merge actual counts with filled ones and sort
  return [...data, ...newPoints].sort((a, b) => a.x.diff(b.x))
}

/** Find intervals within the full timespan where no material is dated. */
export function getEmptyIntervals(data: SeriesPoint[]): SeriesPoint[][] {
  const intervals: SeriesPoint[][] = []
  let i = 0

  // TODO Last point is always (?) null, so we'll get a pointless empty interval at the end. Shouldn't we remove the empty last point?
  while (i < data.length) {
    let item = data[i]

    if (item.y === null) {
      const interval = [{ ...item }]
      let breaker = true
      while (breaker) {
        i++
        item = data[i]
        if ((item != null ? item.y : undefined) === null) {
          interval.push({ ...item })
        } else {
          intervals.push(interval)
          breaker = false
        }
      }
    }
    i++
  }

  return intervals
}

export function getTimeCqp(m: Moment, zoom: Level) {
  let timecqp: string

  const datefrom = moment(m).startOf(zoom).format("YYYYMMDD")
  const dateto = moment(m).endOf(zoom).format("YYYYMMDD")

  /**
   * Create an expression that matches all tokens that have their from and to time data *inside* the interval
   * Or have *both* from date/time and to date/time *outside* the interval
   */

  if (LEVELS.indexOf(zoom) < 3) {
    // year, month, day
    const dateInside = `(int(_.text_datefrom) >= ${datefrom} & int(_.text_dateto) <= ${dateto})`
    const dateOutside = `(int(_.text_datefrom) <= ${datefrom} & int(_.text_dateto) >= ${dateto})`
    timecqp = `[${dateInside} | ${dateOutside}]`
  } else {
    // hour, minute, second
    const timefrom = moment(m).startOf(zoom).format("HHmmss")
    const timeto = moment(m).endOf(zoom).format("HHmmss")
    const startsSameDate = `(int(_.text_datefrom) = ${datefrom} & int(_.text_dateto) <= ${dateto})`
    const timeInside = `(int(_.text_timefrom) >= ${timefrom} & int(_.text_timeto) <= ${timeto})`
    const startsBefore = `(int(_.text_datefrom) < ${datefrom} | (int(_.text_datefrom) = ${datefrom} & int(_.text_timefrom) <= ${timefrom}))`
    const endsAfter = `(int(_.text_dateto) > ${dateto} | (int(_.text_dateto) = ${dateto} & int(_.text_timeto) >= ${timeto}))`
    timecqp = `[(${startsSameDate} & ${timeInside}) | (${startsBefore} & ${endsAfter})]`
  }

  // In case the main query matches multiple tokens, this subquery must only match the first token in the main match.
  timecqp = `<match> ${timecqp} []{0,} </match>`
  return timecqp
}

export function parseDate(zoom: Level, time: string) {
  return moment(time, PARSE_FORMATS[zoom])
}

export function formatUnixDate(zoom: Level, time: number) {
  // TODO this should respect locale and could present whole months as August 2020 instead of 2020-08
  const m = moment.unix(time)
  return m.format(FORMATS[zoom])
}

/** Replace a part of the graph with new data (of a higher/lower resolution) */
export function spliceGraphData(baseData: Series[], newData: Series[]) {
  for (let seriesIndex = 0; seriesIndex < baseData.length; seriesIndex++) {
    const baseSeries = baseData[seriesIndex]!
    const newSeries = newData[seriesIndex]!
    const first = newSeries.points[0]!.x
    const last_ = last(newSeries.points)!.x

    // Walk through old data, match timestamps with new data and find out what part to replace
    let startSplice = false
    let from = 0
    // Default to replacing everything in case counting fails?
    let n_elems = baseSeries.points.length + newSeries.points.length
    let j = 0
    for (let i = 0; i < baseSeries.points.length; i++) {
      const { x } = baseSeries.points[i]!
      if (x >= first && !startSplice) {
        // Overlapping range starts here
        startSplice = true
        from = i
      }
      if (startSplice) {
        // Count number of elements to replace
        j++
        // Stop counting at end of new data
        if (x >= last_) {
          n_elems = j
          break
        }
      }
    }

    // Replace overlap with new data
    baseSeries.points.splice(from, n_elems, ...newSeries.points)
  }
}

export function createTrendTableCsv(series: Series[], relative: boolean): (string | number)[][] {
  // Create header row
  const formatHeader = (cell: SeriesPoint): string =>
    moment(cell.x * 1000).format(FORMATS[cell.zoom])
  const dateHeaders = series[0].data.map(formatHeader)
  const header = [loc("stats_hit"), ...dateHeaders]

  // Create data rows
  const formatCell = (row: Series, cell: SeriesPoint): number => {
    if (relative) return cell.y
    else {
      const i = sortedIndexOf(
        row.abs_data.map((point) => point.x),
        cell.x,
      )
      return row.abs_data[i].y
    }
  }
  const data = series.map((row) => [row.name, ...row.data.map((cell) => formatCell(row, cell))])

  return [header, ...data]
}
