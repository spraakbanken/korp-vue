import type { FrequenciesDataRow } from "../backend/endpoints/FrequenciesEndpoint"

export type StatisticsResult = {
  rows: Dataset
  reduceVals: string[]
  ignoreCase: boolean
  originalCorpora: string[]
  corpora: string[]
  prevNonExpandedCQP: string
}

/** May modify the statistics result */
export type StatisticsPostprocessor = (result: StatisticsResult) => void

export type Row = TotalRow | SingleRow

export type TotalRow = Omit<FrequenciesDataRow, "value"> & {
  isTotal: true
}

export type SingleRow = StandardSingleRow | PhraseLevelDisjunctionRow

/** A row of frequencies for a given set of attribute values */
export type StandardSingleRow = FrequenciesDataRow

/**
 * A statistics row where a disjunction in CQP should be on phrase level:
 * `[T1] [U1] | [T2] [U2]` instead of `[T1 | T2] [U1 | U2]`
 */
export type PhraseLevelDisjunctionRow = StandardSingleRow & {
  isPhraseLevelDisjunction: true
  /** Original values for all items in the group */
  values: FrequenciesDataRow["value"][]
}

export const isTotalRow = (row: Row): row is TotalRow => !("value" in row)
export const isStandardSingleRow = (row: Row): row is StandardSingleRow =>
  !isTotalRow(row) && !("isPhraseLevelDisjunction" in row)
export const isPhraseLevelDisjunctionRow = (row: Row): row is PhraseLevelDisjunctionRow =>
  !isTotalRow(row) && "isPhraseLevelDisjunction" in row

export type Dataset = Row[]
