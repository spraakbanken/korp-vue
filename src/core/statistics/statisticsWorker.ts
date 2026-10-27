import type {
  AbsRelSeq,
  Dataset,
  SingleRow,
  TotalRow,
  StatisticsWorkerMessage,
} from "./statistics.types"
import type { FrequencyCounts } from "../backend/korp-api"
import { fromKeys } from "../util"

/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

const isStatisticsMessageEvent = (e: MessageEvent): e is MessageEvent<StatisticsWorkerMessage> =>
  e.data.type === "korpStatistics"

onmessage = function (e) {
  // Ignore messages sent by Webpack dev server.
  if (!isStatisticsMessageEvent(e)) return

  const message = e.data
  const { combined, corpora, rows } = message.data
  const corpusIds = Object.keys(corpora)

  // Pre-allocate array for performance
  const dataset: Dataset = new Array(rows.length + 1)

  dataset[0] = {
    id: "row_total",
    count: fromKeys(corpusIds, id => toAbsRelSeq(corpora[id].sums)),
    total: toAbsRelSeq(combined.sums),
    rowId: 0,
  } satisfies TotalRow

  rows.forEach((row, i) => {
    const plainValue: Record<string, null | string>[] = []

    // Transpose value object to array of objects, one per token
    for (const [attr, terms] of Object.entries(row.value)) {
      terms.forEach((term, j) => {
        plainValue[j] ??= {}
        plainValue[j][attr] = term
      })
    }

    dataset[i + 1] = {
      rowId: i + 1,
      count: fromKeys(corpusIds, id => toAbsRelSeq(row.corpora[id])),
      total: toAbsRelSeq(row.combined),
      formattedValue: {},
      plainValue,
    } satisfies SingleRow
  })

  // Sort by total counts instead of first corpus counts
  dataset.sort((a, b) => b.total[0] - a.total[0])

  self.postMessage(dataset)
}

const toAbsRelSeq = (row?: FrequencyCounts): AbsRelSeq =>
  row ? [row.absolute, row.relative] : [0, 0]
