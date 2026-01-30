/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count_time/get */

import type { AbsRelTuple, Granularity, NumericString } from "./common"

export type CountTimeParams = {
  corpus: string
  cqp: string
  default_within?: string
  with?: string
  [subcqpn: `subcqp${string}`]: string
  granularity?: Granularity
  from?: NumericString
  to?: NumericString
  strategy?: 1 | 2 | 3
  per_corpus?: boolean
  combined?: boolean
  [cqpn: `cqp${number}`]: string
  expand_prequeries?: boolean
  incremental?: boolean
}

/** The data series are arrays if `subcqpN` parameters were used */
export type CountTimeResponse = {
  /** Present if `per_corpus` was enabled */
  corpora?: Record<string, GraphStatsSum | GraphStats[]>
  /** Present if `combined` was enabled – let's assume it is */
  combined: GraphStatsSum | GraphStats[]
}

export type GraphStats = GraphStatsSum | GraphStatsSub

/** A series corresponding to the totals row */
export type GraphStatsSum = {
  absolute: Record<NumericString, number | null>
  relative: Record<NumericString, number | null>
  sums: AbsRelTuple
}

/** A series corresponding to a `subcqpN` parameter */
export type GraphStatsSub = GraphStatsSum & { cqp: string }
