import { compact } from "lodash-es"
import {
  isPhraseLevelDisjunctionRow,
  isStandardSingleRow,
  isTotalRow,
  type Dataset,
  type SearchParams,
  type SingleRow,
  type StatisticsPostprocessor,
  type StatisticsProcessed,
  type StatisticsWorkerMessage,
} from "./statistics.types"
import { corpusSelection } from "../corpora/corpusListing"
import { regescape, splitSuffix } from "../util"
import settings, { prefixAttr } from "../config"
import type { CqpStringifier, ListStringifier, Stringifier } from "@/attributes/attributes.types"
import { joinWords } from "../corpora/attribute"
import type { FrequenciesData } from "../backend/endpoints/FrequenciesEndpoint"

export function processStatisticsResult(
  originalCorpora: string[],
  data: FrequenciesData,
  reduceVals: string[],
  ignoreCase: boolean,
  prevNonExpandedCQP: string,
  stringifiers: Record<string, { token: Stringifier; list?: ListStringifier }>,
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
    // Worker code cannot import settings
    groupStatistics: settings.group_statistics,
  } satisfies StatisticsWorkerMessage)

  // Return a promise that resolves when the worker is done
  return new Promise((resolve) => {
    worker.onmessage = (e: MessageEvent<Dataset>) => {
      // Terminate worker to free up resources
      worker.terminate()
      const rows = e.data

      // Format the values of the attributes we are reducing by
      for (const row of rows) {
        if (isTotalRow(row)) continue
        for (const attr of reduceVals) {
          const stringifier = stringifiers[attr]?.token || String
          const listStringifier = stringifiers[attr]?.list
          const words = compact(
            isStandardSingleRow(row)
              ? row.statsValues.map((word) => word[attr]?.[0])
              : row.statsValues.map((words) => words[0][attr]?.[0]),
          )
          const formatted = listStringifier
            ? listStringifier(words)
            : joinWords(words.map(stringifier))
          row.formattedValue[attr] = formatted
        }
      }

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
  // isPhraseLevelDisjunction can be set in custom code for constructing cqp like: ([] | [])
  if (isPhraseLevelDisjunctionRow(row)) {
    // In this case the statsValues array is one level deeper
    return row.statsValues.map((values) => getCqp(values, ignoreCase, cqpStringifiers)).join(" | ")
  }

  // Normal case
  return getCqp(row.statsValues, ignoreCase, cqpStringifiers)
}

export function getCqp(
  hitValues: Record<string, null | string[]>[],
  ignoreCase: boolean,
  cqpStringifiers: Record<string, CqpStringifier | undefined>,
): string {
  const tokens = hitValues
    .map((token) =>
      Object.entries(token).map(([name, values]) => {
        if (values) return reduceCqp(name, values, ignoreCase, cqpStringifiers[name])
        // Handle null value
        const attribute = corpusSelection.getReduceAttrs()[name]
        return `${attribute ? prefixAttr(attribute) : name} = "__UNDEF__"`
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
  /** `values` is multiple if multiple result rows were grouped into one, e.g. ranked or MWE */
  values: string[],
  ignoreCase: boolean,
  cqpStringifier?: CqpStringifier,
): string {
  // Note: undefined if name is `word`
  const attr = corpusSelection.getReduceAttrs()[name]

  // Use named CQP'ifier from custom config code. It must escape values as regex.
  if (cqpStringifier) return cqpStringifier(values, ignoreCase)

  const cqpName = attr ? prefixAttr(attr) : name

  // Empty value: for multi-value attr, match tokens with 0 values.
  // For structs, use negative container test. For other attrs, compare to empty string. The statistics data doesn't distinguish these.
  if (values[0] == "")
    return attr?.type == "set" ? `ambiguity(${cqpName}) = 0` : `(!${cqpName} | ${cqpName} = "")`

  // Escape values for use in CQP regex
  values = values.map(regescape)
  // Combine grouped values
  const cqpValue = values.length > 1 ? splitSuffix(values[0])[0] + "(:[-0-9\\.]+)*" : values[0]
  // Support case-insensitive search
  const flag = name == "word" && ignoreCase ? " %c" : ""

  const op = attr?.type === "set" ? "contains" : "="

  // For a ranked attribute, only match the first value in the list.
  // The rank suffix is handled above (replaced with a wildcard or left in place).
  if (attr?.ranked) return `${cqpName} = '\\|${cqpValue}.*'${flag}`

  return `${cqpName} ${op} '${cqpValue}'${flag}`
}

export function createStatisticsCsv(
  data: Dataset,
  attrs: string[],
  corpusTitles: Record<string, string>,
  relative: boolean,
  totalStr: string,
): (string | number)[][] {
  /** Which value to pick from each `[abs, rel]` cell */
  const frequencyIndex = relative ? 1 : 0
  const header = [...attrs, totalStr, ...Object.values(corpusTitles)]

  const output = data.map((row) => {
    // One cell per grouped attribute
    const attrValues = attrs.map((attr) => (isTotalRow(row) ? "Σ" : row.plainValue[attr]))
    const corpusIds = Object.keys(corpusTitles)
    const frequencies = corpusIds.map((id) => row.count[id][frequencyIndex])
    return [...attrValues, row.total[frequencyIndex], ...frequencies]
  })

  return [header, ...output]
}
