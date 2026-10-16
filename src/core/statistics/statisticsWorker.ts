import { keyBy, mapValues } from "lodash-es"
import type {
  AbsRelSeq,
  Dataset,
  SingleRow,
  TotalRow,
  StatisticsWorkerMessage,
} from "./statistics.types"
import type { FrequencyRow, FrequencySums } from "../backend/korp-api"

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
  const { combined, corpora } = message.data

  // Format all values as strings to use as row keys
  // The key list is 1:1 to the combined list, but not necessarily to the corpus-specific list
  const keys = combined.rows.map(createKey)
  // Key the rows of each corpus, to access them quickly later
  const rowsKeyed = mapValues(corpora, (data) => keyBy(data.rows, createKey))

  // Pre-allocate array for performance
  const dataset: Dataset = new Array(keys.length + 1)

  dataset[0] = {
    id: "row_total",
    count: mapValues(corpora, (data) => toAbsRelSeq(data.sums)),
    total: toAbsRelSeq(combined.sums),
    rowId: 0,
  } satisfies TotalRow

  keys.forEach((key, i) => {
    const plainValue: Record<string, null | string>[] = []

    for (const [attr, terms] of Object.entries(combined.rows[i].value)) {
      terms.forEach((term, j) => {
        plainValue[j] ??= {}
        plainValue[j][attr] = term
      })
    }

    dataset[i + 1] = {
      rowId: i + 1,
      count: mapValues(rowsKeyed, (rows) => toAbsRelSeq(rows[key])),
      total: toAbsRelSeq(combined.rows[i]),
      formattedValue: {},
      plainValue,
    } satisfies SingleRow
  })

  // Sort by total counts instead of first corpus counts
  dataset.sort((a, b) => b.total[0] - a.total[0])

  self.postMessage(dataset)
}

const createKey = (row: FrequencyRow): string => JSON.stringify(Object.values(row.value))

const toAbsRelSeq = (row?: FrequencySums): AbsRelSeq =>
  row ? [row.absolute, row.relative] : [0, 0]
