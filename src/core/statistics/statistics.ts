import { compact } from "lodash-es"
import type { CountsMerged } from "../backend/types/count"
import {
  isTotalRow,
  type Dataset,
  type SearchParams,
  type StatisticsProcessed,
  type StatisticsWorkerMessage,
} from "./statistics.types"
import { corpusSelection } from "../corpora/corpusListing"
import { regescape, splitFirst } from "../util"
import settings, { prefixAttr } from "../config"
import type { Stringifier } from "@/attributes/attributes.types"

const customFunctions: Record<string, Stringifier> = {}

// TODO
// try {
//   customFunctions = require("custom/statistics.js").default
// } catch (error) {
//   console.log("No module for statistics functions available")
// }

export function processStatisticsResult(
  originalCorpora: string,
  data: CountsMerged,
  reduceVals: string[],
  ignoreCase: boolean,
  prevNonExpandedCQP: string,
  stringifiers: Record<string, Stringifier>,
): Promise<StatisticsProcessed> {
  const corpora = Object.keys(data.corpora)

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
          const words = compact(row.statsValues.map((word) => word[attr]?.[0]))
          const wordsFormatted = words.map(stringifiers[attr]!)
          // Join with spaces and then squash redundant and surrounding space.
          row.formattedValue[attr] = wordsFormatted.join(" ").trim().replace(/\s+/g, " ")
        }
      }

      let processed: StatisticsProcessed = { rows, params }

      if (settings["statistics_postprocess"]) {
        processed = settings["statistics_postprocess"](processed)
      }

      resolve(processed)
    }
  })
}

export function getCqp(hitValues: Record<string, string[]>[], ignoreCase: boolean): string {
  const tokens = hitValues
    .map((token) =>
      Object.entries(token).map(([attr, values]) => reduceCqp(attr, values, ignoreCase)),
    )
    .map((conditions) => "[" + conditions.join(" & ") + "]")

  // If reducing by structural attributes only, then `hitValues` has only the first match token,
  // so allow any number of subsequent tokens in the match.
  return `<match> ${tokens.join(" ")} []{0,} </match>`
}

function reduceCqp(
  name: string,
  /** `values` is multiple if multiple result rows were grouped into one, e.g. ranked or MWE */
  values: string[],
  ignoreCase: boolean,
): string {
  // Note: undefined if name is `word`
  const attr = corpusSelection.getReduceAttrs()[name]

  // Use named CQP'ifier from custom config code. It must escape values as regex.
  if (attr?.stats_cqp) return customFunctions[attr.stats_cqp]!(values, ignoreCase)

  const cqpName = attr ? prefixAttr(attr) : name

  // Empty value: require number of values to be 0
  if (values[0] == "") return `ambiguity(${cqpName}) = 0`

  // Escape values for use in CQP regex
  values = values.map(regescape)
  // Combine grouped values
  const cqpValue = values.length > 1 ? mergeRegex(values) : values[0]
  // Enclose in quotes and support case-insensitive search
  let quoted = `'${cqpValue}'`
  if (name == "word" && ignoreCase) quoted += " %c"

  const op = attr?.type === "set" ? "contains" : "="
  return `${cqpName} ${op} ${quoted}`
}

/** Merge ["foo:X", "foo:Y"] to "foo:(X|Y)" */
function mergeRegex(values: string[]): string {
  const init = splitFirst(":", values[0]!)[0]
  const tails = values.map((v) => splitFirst(":", v)[1])
  return init + ":(" + tails.join("|") + ")"
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
    // TODO Should isPhraseLevelDisjunction be handled here?
    const attrValues = attrs.map((attr) => (isTotalRow(row) ? "Σ" : row.plainValue[attr]!))
    const corpusIds = Object.keys(corpusTitles)
    const frequencies = corpusIds.map((id) => row.count[id.toUpperCase()]![frequencyIndex])
    return [...attrValues, row.total[frequencyIndex], ...frequencies]
  })

  return [header, ...output]
}
