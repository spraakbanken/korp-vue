import type { Moment } from "moment"
import type { CountTimeParams } from "../backend/types/countTime"
import { GRANULARITIES, parseDate, type Level } from "../trend/util"
import { TaskBase } from "./TaskBase"
import type { NumericString, ProgressHandler } from "../backend/types"
import { padStart } from "lodash"
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

export type Point = {
  /** Time (start of an interval being counted) */
  x: Moment
  /** Relative frequency */
  y: number
  /** Absolute frequency */
  absolute: number
}

export class TrendTask extends TaskBase<TrendResult> {
  constructor(
    readonly cqp: string,
    readonly subqueries: [string, string][],
    readonly showTotal: boolean,
    readonly corpusSet: CorpusSet,
    readonly defaultWithin?: string,
  ) {
    super()
  }

  async send(level: Level, from: Moment, to: Moment, onProgress: ProgressHandler<"count_time">) {
    this.abort()

    const formatDate = (d: Moment) => d.format("YYYYMMDDHHmmss") as NumericString

    const padLength = String(this.subqueries.length).length
    // TODO: fix this for struct attrs
    const subcqps = Object.fromEntries(
      this.subqueries.map(([cqp], i) => [`subcqp${padStart(String(i), padLength, "0")}`, cqp]),
    )

    const params: CountTimeParams = {
      cqp: expandCqp(this.cqp),
      default_within: this.defaultWithin,
      corpus: this.corpusSet.stringify(),
      granularity: GRANULARITIES[level],
      from: formatDate(from),
      to: formatDate(to),
      incremental: true,
      per_corpus: false,
      ...subcqps,
    }

    const abortSignal = this.getAbortSignal()
    const response = await korpRequest("count_time", params, { abortSignal, onProgress })

    const labels = Object.fromEntries(this.subqueries)
    const seriesRaw = Array.isArray(response.combined) ? response.combined : [response.combined]
    const series: Series[] = seriesRaw.map((series) => ({
      // TODO Fill zeroes
      points: Object.entries(series.relative).map(
        ([timestamp, frequency]): Point => ({
          x: parseDate(level, timestamp),
          y: frequency,
          absolute: series.absolute[timestamp as `${number}`]!,
        }),
      ),
      label: "cqp" in series ? labels[series.cqp] : undefined,
      subcqp: "cqp" in series ? series.cqp : undefined,
    }))

    return { series, level }
  }
}
