export type CqpQuery = CqpItem[]

export type CqpItem = CqpToken | CqpStruct | CqpBound

export type CqpToken = {
  and_block: Condition[][]
  /** `[min]` or `[min, max]` */
  repeat?: [number] | [number, number]
}

/** Represents a start/end boundary of a structural element, typically a sentence. */
export type CqpStruct = {
  struct: string
  start: boolean
}

/** Alternative way to represent a start/end boundary of a sentence element. */
export type CqpBound = {
  bound: {
    lbound?: true
    rbound?: true
  }
}

export const isCqpToken = (item: CqpItem): item is CqpToken => "and_block" in item
export const isCqpStruct = (item: CqpItem): item is CqpStruct => "struct" in item
export const isCqpBound = (item: CqpItem): item is CqpBound => "bound" in item

export type Condition = {
  type: string
  op: OperatorKorp
  val: Value
  flags?: Record<string, true>
}

export type Value = string | DateRange

/** Should be `[fromdate, todate, fromtime, totime]` */
export type DateRange = (string | number)[]

export type Operator = "=" | "!=" | "contains" | "not contains"

export type OperatorKorp =
  | Operator
  | "^="
  | "_="
  | "&="
  | "*="
  | "!*="
  | "rank_contains"
  | "not_rank_contains"
  | "highest_rank"
  | "not_highest_rank"
  | "regexp_contains"
  | "not_regexp_contains"
  | "starts_with_contains"
  | "not_starts_with_contains"
  | "incontains_contains"
  | "not_incontains_contains"
  | "ends_with_contains"
  | "not_ends_with_contains"
