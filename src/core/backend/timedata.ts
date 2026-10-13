import { assignWith, memoize, partition, pickBy, range, sumBy } from "lodash-es"
import { backendQuery } from "./client"
import settings from "@/core/config"
import { corpusListing, corpusSelection } from "../corpora/corpusListing"
import type { TokenDistributionPeriod, UndatedTokenDistributionPeriod } from "./korp-api"
import { auth } from "../auth"
import { isDated } from "../time"

export type TimeData = {
  byYear: YearPoint[]
  undated: number
}

/** Numeric data by year. */
export type YearSeries = Record<number, number>

/** Numeric data for a specific year. */
export type YearPoint = [number, number]

type Period = TokenDistributionPeriod | UndatedTokenDistributionPeriod

/**
 * Time data, if available.
 *
 * This gets set in `getTimeData()`, so make sure to await that before using this.
 */
export let timeData: TimeData | undefined

/** Fetch and process time data for all corpora in the mode. */
export const getTimeData: () => Promise<TimeData | undefined> = memoize(async () => {
  if (!settings.has_timespan) return undefined

  const corpora = corpusListing.corpora
    .filter((corpus) => !corpus.protected || auth.getCredentials().includes(corpus.id))
    .map((corpus) => corpus.id)
  if (!corpora.length) return undefined

  const data = await backendQuery("/token-distribution", { corpora, granularity: "year" })

  const { dated, undated } = normalizeYearDistribution(data.combined!)

  // Re-structure the combined counts as year-count tuples for plotting
  const byYear: YearPoint[] = timeseriesToTuples(dated)

  // Store time data for non-async use
  timeData = { byYear, undated }

  // Add to corpora
  // TODO Do not mutate
  for (const [id, periods] of Object.entries(data.corpora!)) {
    const corpus = corpusListing.get(id)
    const { dated, undated } = normalizeYearDistribution(periods)
    corpus.time = dated
    corpus.non_time = undated
    // Enable the special date interval search attribute for corpora that have some timestamped data
    if (Object.keys(corpus.time).length > 1) {
      corpus.common_attributes ??= {}
      corpus.common_attributes.date_interval = true
    }
  }
  // Update list of common attributes
  corpusListing.updateAttributes()

  return timeData
})

function normalizeYearDistribution(periods: Period[]) {
  const [datedPeriods, undatedPeriods] = partition(periods, isDated<TokenDistributionPeriod>)
  const undated = sumBy(undatedPeriods, (period) => period.tokens)

  const dated: Record<number, number> = {}
  for (const period of datedPeriods) {
    if (!period.tokens) continue
    const startYear = parseInt(period.start.slice(0, 4))
    const endYear = parseInt(period.end.slice(0, 4))
    const years = range(startYear, endYear + 1)
    for (const year of years) dated[year] = period.tokens
  }

  return { dated, undated }
}

/** Convert time series to year-count tuples */
export function timeseriesToTuples(series?: YearSeries): YearPoint[] {
  return Object.entries(series || {})
    .filter(([, count]) => count > 0)
    .map(([year, count]) => [parseInt(year), count] as YearPoint)
    .sort((a, b) => a[0] - b[0])
}

/** Data size per year of all corpora. */
export const getTimeDataPairs = (): YearPoint[] => timeData!.byYear

/** Get data size per year of all corpora. */
export const getSeries = () => Object.fromEntries(getTimeDataPairs()) as YearSeries

/** Get data size per year of selected corpora. */
export function getSeriesSelected() {
  // `pickBy` removes zeroes.
  const series = corpusSelection.map((corpus) => ("time" in corpus ? pickBy(corpus.time) : {}))
  // Sum the counts by year of all corpora
  return assignWith<YearSeries>(
    {},
    ...series,
    (sum: number | undefined, value: number) => (sum || 0) + value,
  )
}
