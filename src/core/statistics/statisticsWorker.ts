import { groupBy, mapValues, sumBy } from "lodash-es"
import type {
  AbsRelSeq,
  Dataset,
  SingleRow,
  TotalRow,
  StatisticsWorkerMessage,
} from "./statistics.types"
import { splitSuffix } from "../util"
import type { FrequencyRow } from "../backend/korp-api"

/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

const isStatisticsMessageEvent = (e: MessageEvent): e is MessageEvent<StatisticsWorkerMessage> =>
  e.data.type === "korpStatistics"

/** Represents `null` in keys used for grouping rows */
const NULL_PLACEHOLDER = "_NULL"

onmessage = function (e) {
  // Ignore messages sent by Webpack dev server.
  if (!isStatisticsMessageEvent(e)) return

  const message = e.data
  const { combined, corpora } = message.data

  const simplifyValue = function (values: (string | null)[], attr: string): string {
    if (message.groupStatistics.includes(attr))
      // For these attrs, ":" must only be used when merging is desired, e.g. for ranking or MWE indexing.
      values = values.map((value) => splitSuffix(value || NULL_PLACEHOLDER)[0])
    return values.join(" ")
  }

  /**
   * This function creates a string representation of
   * the row, to group values by. Using "simplifyValue"
   * it removes suffixes `:<rank/numbering>` from
   * attributes that are in `group_statistics` in config.yml
   */
  const simplifyHitString = (item: FrequencyRow): string =>
    Object.entries(item.value)
      .map(([attr, values]) => simplifyValue(values, attr))
      .join("/")

  // Group data by simplified values, e.g. "foo:12" and "foo:34" under "foo"
  const groupedRows = groupBy(combined.rows || [], (item) => simplifyHitString(item))
  const rowIds = Object.keys(groupedRows)
  // Pre-allocate array for performance
  const dataset: Dataset = new Array(rowIds.length + 1)

  const totalsByCorpus = mapValues(
    corpora,
    (data) => [data.sums.absolute, data.sums.relative] as AbsRelSeq,
  )
  const corporaFreqs = mapValues(corpora, (data) =>
    groupBy(data.rows, (item) => simplifyHitString(item)),
  )

  dataset[0] = {
    id: "row_total",
    count: totalsByCorpus,
    total: [combined.sums.absolute, combined.sums.relative],
    rowId: 0,
  } satisfies TotalRow

  for (let i = 0; i < rowIds.length; i++) {
    const rowId = rowIds[i]
    /** Actual (pre grouping) values by attribute per token, used for creating sub CQPs. */
    const statsValues: Record<string, null | string[]>[] = []
    const plainValue: Record<string, string> = {}

    for (const row of groupedRows[rowId]) {
      // Walk through original values, e.g. "foo:12" and "foo:34"
      for (const [attr, terms] of Object.entries(row.value)) {
        // The array has one value per word in match
        terms.forEach((term, idx) => {
          statsValues[idx] ??= {}
          if (term == null) {
            statsValues[idx][attr] = null
          } else {
            statsValues[idx][attr] ??= []
            if (!statsValues[idx][attr].includes(term)) {
              statsValues[idx][attr].push(term)
            }
          }
        })
        plainValue[attr] = simplifyValue(terms, attr)
      }
    }

    dataset[i + 1] = {
      rowId: i + 1,
      count: mapValues(corporaFreqs, (freqs) => sumByAbsRel(freqs[rowId])),
      total: sumByAbsRel(groupedRows[rowId]),
      formattedValue: {},
      plainValue,
      statsValues,
    } satisfies SingleRow
  }

  dataset.sort((a, b) => b.total[0] - a.total[0])

  self.postMessage(dataset)
}

const sumByAbsRel = (rows: FrequencyRow[]): AbsRelSeq => [
  sumBy(rows, "absolute"),
  sumBy(rows, "relative"),
]
