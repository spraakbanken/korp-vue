import type { CountTimeParams, CountTimeResponse } from "../backend/types/countTime"
import { dateEndOf, dateStartOf, type Level } from "@/core/time"
import { fillMissingDate, GRANULARITIES, parseDate } from "../trend/util"
import { TaskBase } from "./TaskBase"
import type { NumericString, ProgressHandler } from "../backend/types"
import { padStart } from "lodash-es"
import { expandCqp } from "../cqp/cqp"
import { korpRequest } from "../backend/common"
import type { CorpusSet } from "../corpora/CorpusSet"

export type TrendResult = {
  series: Series[]
  level: Level
}

export type Series = {
  points: Point[]
  /** The value being counted */
  label?: string
  /** CQP used to match the value */
  subcqp?: string
}

/** A time point with optional frequency. The type generic helps sync the types of the frequency fields. */
export type Point<TEmpty extends boolean = false> = {
  /** Time (start of an interval being counted) */
  x: Date
  /** Relative frequency */
  y: TEmpty extends true ? null : number
  /** Absolute frequency */
  absolute: TEmpty extends true ? null : number
}

export class TrendTask extends TaskBase<TrendResult> {
  public response: CountTimeResponse | undefined = undefined

  constructor(
    readonly cqp: string,
    readonly subqueries: [string, string][],
    readonly showTotal: boolean,
    readonly corpusSet: CorpusSet,
    readonly defaultWithin?: string,
  ) {
    super()
  }

  async send(
    level: Level,
    from: Date,
    to: Date,
    onProgress: ProgressHandler<"count_time">,
  ): Promise<TrendResult> {
    this.abort()

    const formatDate = (d: Date) => d.toISOString().replace(/\D/g, "").slice(0, 14) as NumericString

    const padLength = String(this.subqueries.length).length
    const subcqps = Object.fromEntries(
      this.subqueries.map(([cqp], i) => [`subcqp${padStart(String(i), padLength, "0")}`, cqp]),
    )

    const params: CountTimeParams = {
      cqp: expandCqp(this.cqp),
      default_within: this.defaultWithin,
      corpus: this.corpusSet.stringify(),
      granularity: GRANULARITIES[level],
      from: formatDate(dateStartOf(from, level)),
      to: formatDate(dateEndOf(to, level)),
      incremental: true,
      per_corpus: false,
      ...subcqps,
    }

    const abortSignal = this.getAbortSignal()
    this.response = await korpRequest("count_time", params, { abortSignal, onProgress })

    // Process response data
    const labels = Object.fromEntries(this.subqueries)
    // Response data is array iff subcqps were used; ensure array for consistency
    const seriesRaw = Array.isArray(this.response.combined)
      ? this.response.combined
      : [this.response.combined]
    const series: Series[] = seriesRaw.map((series) => {
      const entries = Object.entries(series.relative) as [NumericString, number | null][]
      const points: Point[] = entries.map(
        ([timestamp, frequency]) =>
          ({
            x: parseDate(timestamp),
            y: frequency,
            absolute: series.absolute[timestamp],
          }) as Point,
      )
      return {
        points: fillMissingDate(points, level),
        // Label and subcqp only present for subquery rows, not the total row
        label: "cqp" in series ? labels[series.cqp] : undefined,
        subcqp: "cqp" in series ? series.cqp : undefined,
      }
    })

    return { series, level }
  }
}
