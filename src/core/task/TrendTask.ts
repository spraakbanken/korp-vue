import type { Moment } from "moment"
import type { CountTimeParams, CountTimeResponse } from "../backend/types/countTime"
import { GRANULARITIES, type Level } from "../trend-diagram/util"
import { TaskBase } from "./TaskBase"
import type { NumericString, ProgressHandler } from "../backend/types"
import { padStart } from "lodash"
import { expandCqp } from "../cqp/cqp"
import { korpRequest } from "../backend/common"
import type { CorpusSet } from "../corpora/CorpusSet"

export class TrendTask extends TaskBase<CountTimeResponse> {
  constructor(
    readonly cqp: string,
    readonly subqueries: [string, string][],
    readonly showTotal: boolean,
    readonly corpusSet: CorpusSet,
    readonly defaultWithin?: string,
  ) {
    super()
  }

  send(zoom: Level, from: Moment, to: Moment, onProgress: ProgressHandler<"count_time">) {
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
      granularity: GRANULARITIES[zoom],
      from: formatDate(from),
      to: formatDate(to),
      incremental: true,
      per_corpus: false,
      ...subcqps,
    }

    const abortSignal = this.getAbortSignal()
    return korpRequest("count_time", params, { abortSignal, onProgress })
  }
}
