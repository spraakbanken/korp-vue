import { cloneDeep, compact, sortBy } from "lodash"
import { parse } from "./CQPParser.peggy"
import {
  isCqpBound,
  isCqpStruct,
  isCqpToken,
  type Condition,
  type CqpQuery,
  type DateRange,
  type Operator,
  type OperatorKorp,
  type Value,
} from "./cqp.types"
import { corpusSelection } from "../corpora/corpusListing"
import settings from "../config"

/** Parse CQP string to syntax tree. */
export { parse }

/**
 * Create CQP expression for a date interval condition.
 *
 * @param opKorp Operator to use if not using `expanded_format`
 * @param range An array like `[fromdate, todate, fromtime, totime]`
 * @param expanded_format Whether to convert to standard CQP or keep Korp-specific operators
 */
export function parseDateInterval(
  opKorp: OperatorKorp,
  range: DateRange | string,
  expanded_format?: boolean,
) {
  // `range` could be a string if the query is being edited in extended search
  if (!Array.isArray(range)) return ""
  if (!expanded_format) return `$date_interval ${opKorp} '${range.join(",")}'`

  const [fromdate, todate, fromtime, totime] = range
  if (!fromdate || !todate) return ""

  const isFromDateSame = `int(_.text_datefrom) = ${fromdate}`
  const isFromDateInclusive = `int(_.text_datefrom) >= ${fromdate}`
  const isFromDateExclusive = `int(_.text_datefrom) > ${fromdate}`
  const isFromTimeInclusive = `(${isFromDateSame} & int(_.text_timefrom) >= ${fromtime})`

  const isToDateSame = `int(_.text_dateto) = ${todate}`
  const isToDateInclusive = `int(_.text_dateto) <= ${todate}`
  const isToDateExclusive = `int(_.text_dateto) < ${todate}`
  const isToTimeInclusive = `(${isToDateSame} & int(_.text_timeto) <= ${totime})`

  if (String(fromdate) == String(todate)) {
    const fromCond = fromtime == "000000" ? isFromDateSame : isFromTimeInclusive
    const toCond = totime == "235959" ? isToDateSame : isToTimeInclusive
    return `${fromCond} & ${toCond}`
  }

  const fromCond =
    fromtime == "000000" ? isFromDateInclusive : `(${isFromTimeInclusive} | ${isFromDateExclusive})`
  const toCond =
    totime == "235959" ? isToDateInclusive : `(${isToTimeInclusive} | ${isToDateExclusive})`
  return `${fromCond} & ${toCond}`
}

/** Helps parsing a frontend-type operator to a standard operator and a modified value. */
const operatorMap: Readonly<Record<OperatorKorp, (val: Value) => [Value, Operator]>> = {
  "=": (val) => [val, "="],
  "!=": (val) => [val, "!="],
  contains: (val) => [val, "contains"],
  "not contains": (val) => [val, "not contains"],
  "^=": (val) => [val + ".*", "="],
  "_=": (val) => [`.*${val}.*`, "="],
  "&=": (val) => [`.*${val}`, "="],
  "*=": (val) => [val, "="],
  "!*=": (val) => [val, "!="],
  rank_contains: (val) => [val + ":.*", "contains"],
  not_rank_contains: (val) => [val + ":.*", "not contains"],
  highest_rank: (val) => [`\\|${val}:.*`, "="],
  not_highest_rank: (val) => [`\\|${val}:.*`, "!="],
  regexp_contains: (val) => [val, "contains"],
  not_regexp_contains: (val) => [val, "not contains"],
  starts_with_contains: (val) => [`${val}.*`, "contains"],
  not_starts_with_contains: (val) => [`${val}.*`, "not contains"],
  incontains_contains: (val) => [`.*?${val}.*`, "contains"],
  not_incontains_contains: (val) => [`.*${val}.*`, "not contains"],
  ends_with_contains: (val) => [`.*${val}`, "contains"],
  not_ends_with_contains: (val) => [`.*${val}`, "not contains"],
}

/**
 * Serialize syntax tree to CQP string.
 * @param cqp_obj Syntax tree
 * @param expanded_format Whether to convert to standard CQP or keep Korp-specific operators
 */
export function stringify(cqp_obj: CqpQuery, expanded_format?: boolean): string {
  if (expanded_format == null) {
    expanded_format = false
  }
  const output: string[] = []
  cqp_obj = prioSort(cloneDeep(cqp_obj))

  for (const token of cqp_obj) {
    if (typeof token === "string") {
      output.push(token)
      continue
    }

    if (isCqpStruct(token)) {
      output.push(`<${token.start ? "" : "/"}${token.struct}>`)
      continue
    }

    const outer_and_array: string[][] = []
    const andBlock = isCqpToken(token) ? token.and_block : []
    for (const and_array of andBlock) {
      const or_array: string[] = []
      for (const condition of and_array) {
        const { type, flags } = condition
        let { op, val } = condition
        let out
        if (expanded_format) {
          ;[val, op] = operatorMap[op](val)
        }

        let flagstr = ""
        if (flags && Object.keys(flags).length) {
          flagstr = ` %${Object.keys(flags).join("")}`
        }

        if (type === "word" && val === "") {
          out = ""
        } else if (corpusSelection.isDateInterval(type)) {
          out = parseDateInterval(op, val as DateRange, expanded_format)
        } else {
          out = `${type} ${op} \"${val}\"`
        }

        if (out) {
          or_array.push(out + flagstr)
        }
      }
      if (or_array.length) {
        outer_and_array.push(or_array)
      }
    }

    let or_out: string[] = outer_and_array.map((x) =>
      x.length > 1 ? `(${x.join(" | ")})` : x.join(" | "),
    )

    if (isCqpBound(token)) {
      or_out = compact(or_out)
      for (const bound of Object.keys(token.bound)) {
        or_out.push(`${bound}(sentence)`)
      }
    }

    let out_token = `[${or_out.join(" & ")}]`
    if (isCqpToken(token) && token.repeat) {
      out_token += `{${token.repeat.length > 1 ? token.repeat.join(",") : token.repeat + ","}}`
    }

    output.push(out_token)
  }

  return output.join(" ")
}

export const expandOperators = (cqpstr: string) => stringify(parse<CqpQuery>(cqpstr), true)

export function expandCqp(cqp: string): string {
  try {
    return expandOperators(cqp)
  } catch (e) {
    console.warn("CQP expansion failed", cqp, e)
    return cqp
  }
}

/**
 * Sort the conditions in each token according to the `cqp_prio` setting.
 */
export function prioSort(cqpObjs: CqpQuery) {
  const getPrio = function (or_block: Condition[]) {
    const numbers = or_block.map((item) => settings.cqp_prio.indexOf(item.type))
    return Math.min(...(numbers || []))
  }

  for (const token of cqpObjs) {
    if (!isCqpToken(token)) continue
    token.and_block = (sortBy(token.and_block, getPrio) as Condition[][]).reverse()
  }

  return cqpObjs
}

/**
 * Extend the first token of a base query with all conditions from a second query.
 */
export function mergeCqpExprs(baseQuery: CqpQuery, secondQuery: CqpQuery) {
  // Find the first token of the base query
  const baseToken = baseQuery.find(isCqpToken)
  if (!baseToken) throw new Error("Cannot merge to a query without token items")

  // Add all conditions from the second query to the base token
  for (const token of secondQuery.filter(isCqpToken)) baseToken.and_block.push(...token.and_block)

  return baseQuery
}

/** Whether there are more than one token conditions in the query, boundaries excluded */
export const hasMultipleTokenConditions = (query: CqpQuery) =>
  query
    .filter(isCqpToken)
    .flatMap((token) => token.and_block)
    .flat(2).length > 1

/** Check if a query has any wildcards (`[]`) */
export const hasWildcard = (cqpObjs: CqpQuery) =>
  cqpObjs.some((token) => stringify([token]).indexOf("[]") === 0)

/** Check if a query has any tokens with repetition */
export const hasRepetition = (cqpObjs: CqpQuery) =>
  cqpObjs.some((token) => isCqpToken(token) && token.repeat)

/** Check if a query has any structure boundaries, e.g. sentence start */
// TODO include if isCqpBound?
export const hasStruct = (cqpObjs: CqpQuery) => cqpObjs.some(isCqpStruct)

/** Determine whether a query will work with the in_order option */
export const supportsInOrder = (cqpObjs: CqpQuery) =>
  cqpObjs.length > 1 && !hasWildcard(cqpObjs) && !hasRepetition(cqpObjs) && !hasStruct(cqpObjs)

export const createCondition = (val = ""): Condition => ({ type: "word", op: "=", val })
