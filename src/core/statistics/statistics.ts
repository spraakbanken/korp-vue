import {
  isPhraseLevelDisjunctionRow,
  isTotalRow,
  type Dataset,
  type SearchParams,
  type SingleRow,
  type StatisticsPostprocessor,
  type StatisticsProcessed,
  type StatisticsWorkerMessage,
} from "./statistics.types"
import { corpusSelection } from "../corpora/corpusListing"
import { regescape } from "../util"
import settings, { prefixAttr } from "../config"
import type { CqpStringifier } from "@/core/corpora/attributes.types"
import type { FrequenciesData } from "../backend/endpoints/FrequenciesEndpoint"
import type { FrequencyRow } from "../backend/korp-api"

export function processStatisticsResult(
  originalCorpora: string[],
  data: FrequenciesData,
  reduceVals: string[],
  ignoreCase: boolean,
  prevNonExpandedCQP: string,
  postprocess?: StatisticsPostprocessor,
): Promise<StatisticsProcessed> {
  const corpora = Object.keys(data.corpora || {})

  const params: SearchParams = {
    reduceVals,
    ignoreCase,
    originalCorpora,
    corpora,
    prevNonExpandedCQP,
  }

  // Delegate stats processing to a Web Worker for performance
  const worker = new Worker(new URL("./statisticsWorker", import.meta.url), { type: "module" })

  worker.postMessage({
    type: "korpStatistics",
    data,
  } satisfies StatisticsWorkerMessage)

  // Return a promise that resolves when the worker is done
  return new Promise((resolve) => {
    worker.onmessage = (e: MessageEvent<Dataset>) => {
      // Terminate worker to free up resources
      worker.terminate()
      const rows = e.data
      let processed: StatisticsProcessed = { rows, params }
      if (postprocess) processed = postprocess(processed)
      resolve(processed)
    }
  })
}

export function getRowCqp(
  row: SingleRow,
  ignoreCase: boolean,
  cqpStringifiers: Record<string, CqpStringifier | undefined>,
): string {
  const values = valuesByToken(row.row.value)

  // Phrase-level disjunction can be enabled in custom code for constructing cqp like: ([] | [])
  if (isPhraseLevelDisjunctionRow(row)) {
    // In this case create one CQP token sequence for each item in the group
    return row.values
      .map((value) => getCqp(valuesByToken(value), ignoreCase, cqpStringifiers))
      .join(" | ")
  }

  // Normal case
  return getCqp(values, ignoreCase, cqpStringifiers)
}

/** Transpose value object to array of objects, one per token */
function valuesByToken(values: FrequencyRow["value"]) {
  const tokens: Record<string, null | string>[] = []
  for (const [attr, vals] of Object.entries(values)) {
    vals.forEach((val, j) => {
      tokens[j] ??= {}
      tokens[j][attr] = val
    })
  }
  return tokens
}

export function getCqp(
  hitValues: Record<string, null | string>[],
  ignoreCase: boolean,
  cqpStringifiers: Record<string, CqpStringifier | undefined>,
): string {
  const tokens = hitValues
    .map((token) =>
      Object.entries(token).map(([name, value]) => {
        if (value) return reduceCqp(name, value, ignoreCase, cqpStringifiers[name])
        // Handle null value
        const attribute = corpusSelection.getReduceAttrs()[name]
        const cqpName = attribute ? prefixAttr(attribute) : name
        if (attribute?.type === "set") return `ambiguity(${cqpName}) = 0`
        return `${cqpName} = "__UNDEF__"`
      }),
    )
    .map((conditions) => "[" + conditions.join(" & ") + "]")

  // If reducing by structural attributes only, then `hitValues` has only the first match token,
  // so allow any number of subsequent tokens in the match.
  return `<match> ${tokens.join(" ")} []{0,} </match>`
}

/** Build a CQP condition for an attribute and a (set of) values */
function reduceCqp(
  name: string,
  value: string,
  ignoreCase: boolean,
  cqpStringifier?: CqpStringifier,
): string {
  // Note: undefined if name is `word`
  const attr = corpusSelection.getReduceAttrs()[name]

  // Use named CQP'ifier from custom config code. It must escape values as regex.
  if (cqpStringifier) return cqpStringifier(value, ignoreCase)

  const cqpName = attr ? prefixAttr(attr) : name

  // Empty value: for multi-value attr, match tokens with 0 values.
  // For structs, use negative container test. For other attrs, compare to empty string. The statistics data doesn't distinguish these.
  if (value == "")
    return attr?.type == "set" ? `ambiguity(${cqpName}) = 0` : `(!${cqpName} | ${cqpName} = "")`

  // Escape values for use in CQP regex
  value = regescape(value)
  // Allow for suffixes
  if (settings.group_statistics.includes(name)) value += "(:[-0-9\\.]+)*"
  // Support case-insensitive search
  const flag = name == "word" && ignoreCase ? " %c" : ""

  const op = attr?.type === "set" ? "contains" : "="

  // For a ranked attribute, only match the first value in the list.
  // The rank suffix is handled above (replaced with a wildcard or left in place).
  if (attr?.ranked) return `${cqpName} = '\\|${value}.*'${flag}`

  return `${cqpName} ${op} '${value}'${flag}`
}

export function createStatisticsCsv(
  data: Dataset,
  attrs: string[],
  corpusTitles: Record<string, string>,
  relative: boolean,
  totalStr: string,
): (string | number)[][] {
  /** Which value to pick from each `[abs, rel]` cell */
  const freqKey = relative ? "absolute" : "relative"
  const header = [...attrs, totalStr, ...Object.values(corpusTitles)]

  const output = data.map((row) => {
    // One cell per attribute
    const attrValues = attrs.map((attr) => (isTotalRow(row) ? "Σ" : row.row.value[attr].join(" ")))
    const corpusIds = Object.keys(corpusTitles)
    const frequencies = corpusIds.map((id) => row.row.corpora[id][freqKey])
    return [...attrValues, row.row.combined[freqKey], ...frequencies]
  })

  return [header, ...output]
}
