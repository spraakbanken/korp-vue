import { last, minBy } from "lodash-es"
import type { Granularity, NumericString } from "../backend/types"
import type { Point, Series } from "../task/TrendTask"
import {
  addToDate,
  dateEndOf,
  dateStartOf,
  dateToString,
  formatDateOnLevel,
  LEVELS,
  type Level,
} from "../time"

/**
 * Mapping from long to short form of granularities.
 * We use the long form here, and Korp API uses the short form.
 */
export const GRANULARITIES: Record<Level, Granularity> = {
  year: "y",
  month: "m",
  day: "d",
  hour: "h",
  minute: "n",
  second: "s",
}

/** Find a date granularity level that gives a good number of time units in a given range. */
export function findOptimalLevel(from: Date, to: Date): Level {
  // Preferred number of x points in a graph (less is uninformative, more is messy)
  const idealPoints = 300

  // Time difference in seconds
  let diff = Math.abs(to.getTime() - from.getTime()) / 1000

  // Calculate how many points each granularity would give
  const pointsPerLevel = {
    second: diff,
    minute: (diff /= 60),
    hour: (diff /= 60),
    day: (diff /= 24),
    month: (diff /= 30),
    year: (diff /= 12),
  }
  return minBy(LEVELS, (level) => Math.abs(pointsPerLevel[level] - idealPoints))!
}

/**
 * Fill missing time units with the value of the last previous count.
 *
 * The input can have gaps, and the returned list will cover the whole range.
 */
export function fillMissingDate(data: Point[], level: Level): Point[] {
  const dateArray = data.map((point) => point.x)
  // Assume data is ordered and the dates are the same granularity as `level`
  const min = dateArray[0]
  const max = dateArray[dateArray.length - 1]
  if (!min || !max) return data

  // Convert tuple list to map to enable lookup
  const dataMap: Record<string, Point> = Object.fromEntries(
    data.map((point) => [formatDateOnLevel(point.x, level), point]),
  )

  // Step through the range and fill in missing timestamps
  /** Copied counts for unseen timestamps in the range */
  const newPoints: Point[] = []
  let lastPoint = data[0]
  for (let x = new Date(min); x < max; x = addToDate(x, 1, level)) {
    // Get point at timestep
    const point = dataMap[formatDateOnLevel(x, level)]
    // If this timestamp has been counted, remember the count for subsequent uncounted timesteps
    if (point) lastPoint = point
    // Use either found point or last found point
    newPoints.push({ ...lastPoint, x })
  }

  return newPoints
}

export function getTimeCqp(d: Date, zoom: Level) {
  let timecqp: string

  const from = formatCqpDate(dateStartOf(d, zoom))
  const to = formatCqpDate(dateEndOf(d, zoom))

  /**
   * Create an expression that matches all tokens that have their from and to time data *inside* the interval
   * Or have *both* from date/time and to date/time *outside* the interval
   */

  if (LEVELS.indexOf(zoom) < 3) {
    // year, month, day
    const dateInside = `(int(_.text_datefrom) >= ${from.date} & int(_.text_dateto) <= ${to.date})`
    const dateOutside = `(int(_.text_datefrom) <= ${from.date} & int(_.text_dateto) >= ${to.date})`
    timecqp = `[${dateInside} | ${dateOutside}]`
  } else {
    // hour, minute, second
    const startsSameDate = `(int(_.text_datefrom) = ${from.date} & int(_.text_dateto) <= ${to.date})`
    const timeInside = `(int(_.text_timefrom) >= ${from.time} & int(_.text_timeto) <= ${to.time})`
    const startsBefore = `(int(_.text_datefrom) < ${from.date} | (int(_.text_datefrom) = ${from.date} & int(_.text_timefrom) <= ${from.time}))`
    const endsAfter = `(int(_.text_dateto) > ${to.date} | (int(_.text_dateto) = ${to.date} & int(_.text_timeto) >= ${to.time}))`
    timecqp = `[(${startsSameDate} & ${timeInside}) | (${startsBefore} & ${endsAfter})]`
  }

  // In case the main query matches multiple tokens, this subquery must only match the first token in the main match.
  timecqp = `<match> ${timecqp} []{0,} </match>`
  return timecqp
}

/** Get date and time as `YYYYMMDD` and `HHmmss` strings */
export function formatCqpDate(datetime: Date): { date: string; time: string } {
  const sepPos = dateToString(datetime).indexOf("T")
  const date = dateToString(datetime).slice(0, sepPos).replace(/\D/g, "")
  const time = dateToString(datetime)
    .slice(sepPos + 1)
    .replace(/\D/g, "")
  return { date, time }
}

/** Parse a numeric date string into a Date object */
export function parseDate(time: NumericString): Date {
  let iso = ""
  if (time.length >= 4) iso += time.slice(0, 4)
  if (time.length >= 6) iso += "-" + time.slice(4, 6)
  if (time.length >= 8) iso += "-" + time.slice(6, 8)
  if (time.length >= 10) iso += "T" + time.slice(8, 10) + ":00"
  if (time.length >= 12) iso = iso.slice(0, -3) + ":" + time.slice(10, 12)
  if (time.length >= 14) iso += ":" + time.slice(12, 14)
  return new Date(iso)
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

export function createTrendTableCsv(
  series: Series[],
  level: Level,
  relative: boolean,
  hitStr: string,
  totalStr: string,
): (string | number)[][] {
  // Create header row
  const formatHeader = (point: Point): string => formatDateOnLevel(point.x, level)
  const dateHeaders = series[0].points.map(formatHeader)
  const header = [hitStr, ...dateHeaders]

  // Create data rows
  const data = series.map((row) => {
    const freqs = row.points.map((point) => (relative ? point.y : point.absolute) || "")
    return [row.label || "", ...freqs]
  })
  data[0][0] = totalStr

  return [header, ...data]
}
