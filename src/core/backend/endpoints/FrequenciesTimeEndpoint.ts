import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { dateEndOf, dateStartOf, isDated, type Level } from "@/core/time"
import { expandCqp } from "@/core/cqp/cqp"
import { fillMissingDate } from "@/core/trend/util"
import type { FrequenciesTimeResponse, FrequencyTimePeriod } from "../korp-api"
import { EndpointBase } from "./EndpointBase"

export type FrequenciesTimeParams = {
  defaultWithin?: string
  corpusSet: CorpusSet
  cqp: string
  from: Date
  level: Level
  subqueries: [string, string][]
  to: Date
}

export type FrequenciesTimeData = {
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

export class FrequenciesTimeEndpoint extends EndpointBase<
  "/frequencies/time",
  FrequenciesTimeParams,
  FrequenciesTimeData
> {
  protected readonly path = "/frequencies/time"

  async processParams(params: FrequenciesTimeParams) {
    const { defaultWithin, corpusSet, cqp, from, level, subqueries, to } = params

    const formatDate = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ")

    return {
      corpora: corpusSet.getIds(),
      cqp: [expandCqp(cqp)],
      default_within: defaultWithin,
      date_from: formatDate(dateStartOf(from, level)),
      date_to: formatDate(dateEndOf(to, level)),
      granularity: level,
      include_per_corpus: false,
      subcqp: subqueries.map(([cqp]) => cqp),
    }
  }

  async processResponse(data: FrequenciesTimeResponse) {
    const granularity = this.getParams()!.granularity!

    // Response data is array iff subcqps were used; ensure array for consistency
    const series: Series[] = data.combined!.map((series) => {
      const points: Point[] = series.periods
        .filter(isDated<FrequencyTimePeriod>)
        .map(
          ({ start, relative, absolute }) => <Point>{ x: new Date(start), y: relative, absolute },
        )
      return {
        points: fillMissingDate(points, granularity),
        // Label and subcqp only present for subquery rows, not the total row
        subcqp: "cqp" in series ? series.cqp : undefined,
      }
    })

    return { series, level: granularity }
  }
}
