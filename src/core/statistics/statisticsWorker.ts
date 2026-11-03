import type { Dataset, SingleRow, TotalRow, StatisticsWorkerMessage } from "./statistics.types"
import { mapValues } from "lodash-es"

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

  // Pre-allocate array for performance
  const dataset: Dataset = new Array(rows.length + 1)

  dataset[0] = {
    combined: combined.sums,
    corpora: mapValues(corpora, "sums"),
    isTotal: true,
  } satisfies TotalRow

  rows.forEach((row, i) => {
    dataset[i + 1] = row satisfies SingleRow
  })

  // Sort by total counts instead of first corpus counts
  dataset.sort((a, b) => b.combined.absolute - a.combined.absolute)

  self.postMessage(dataset)
}
