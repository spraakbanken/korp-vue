import { type Level } from "@/core/time"
import { TaskBase } from "./TaskBase"
import type { CorpusSet } from "../corpora/CorpusSet"
import { FrequenciesTimeEndpoint } from "../backend/endpoints/FrequenciesTimeEndpoint"
import type { ProgressHandler } from "../backend/client.types"

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
  protected endpoint = new FrequenciesTimeEndpoint()

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
    onProgress: ProgressHandler,
  ): Promise<TrendResult> {
    const response = await this.endpoint.stream(
      {
        cqp: this.cqp,
        subqueries: this.subqueries,
        defaultWithin: this.defaultWithin,
        corpusSet: this.corpusSet,
        level,
        from,
        to,
      },
      onProgress,
    )

    // Add labels to series
    response.series.forEach((series) => {
      const subquery = this.subqueries.find(([subcqp]) => subcqp == series.subcqp)
      series.label = subquery?.[1]
    })

    return response
  }

  getResponse() {
    return this.endpoint.getResponse()
  }
}
