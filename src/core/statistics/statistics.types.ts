import type { FrequenciesData, FrequenciesDataRow } from "../backend/endpoints/FrequenciesEndpoint"

export type StatisticsWorkerMessage = {
  type: "korpStatistics"
  data: FrequenciesData
}

export type StatisticsProcessed = {
  rows: Dataset
  params: SearchParams
}

export type StatisticsPostprocessor = (data: StatisticsProcessed) => StatisticsProcessed

export type SearchParams = {
  reduceVals: string[]
  ignoreCase: boolean
  originalCorpora: string[]
  corpora: string[]
  prevNonExpandedCQP: string
}

export type Row = TotalRow | SingleRow
export type SingleRow = StandardSingleRow | PhraseLevelDisjunctionRow

export type TotalRow = RowBase & {
  id: "row_total"
  row: Omit<FrequenciesDataRow, "value">
}

/** A row of frequencies for a given set of attribute values */
export type StandardSingleRow = RowBase & {
  row: FrequenciesDataRow
}

/**
 * A statistics row where a disjunction in CQP should be on phrase level:
 * `[T1] [U1] | [T2] [U2]` instead of `[T1 | T2] [U1 | U2]`
 */
export type PhraseLevelDisjunctionRow = StandardSingleRow & {
  isPhraseLevelDisjunction: true
  /** Original values for all items in the group */
  values: FrequenciesDataRow["value"][]
}

export const isTotalRow = (row: Row): row is TotalRow => row.rowId === 0
export const isStandardSingleRow = (row: Row): row is StandardSingleRow =>
  !isTotalRow(row) && !("isPhraseLevelDisjunction" in row)
export const isPhraseLevelDisjunctionRow = (row: Row): row is PhraseLevelDisjunctionRow =>
  !isTotalRow(row) && "isPhraseLevelDisjunction" in row

export type RowBase = {
  rowId: number
}

export type Dataset = Row[]
