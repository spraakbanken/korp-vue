import type { CountsMerged } from "../backend/types/count"

export type StatisticsWorkerMessage = {
  type: "korpStatistics"
  data: CountsMerged
  groupStatistics: string[]
}

export type StatisticsProcessed = {
  rows: Dataset
  params: SearchParams
}

export type StatisticsPostprocessor = (data: StatisticsProcessed) => StatisticsProcessed

export type SearchParams = {
  reduceVals: string[]
  ignoreCase: boolean
  originalCorpora: string
  corpora: string[]
  prevNonExpandedCQP: string
}

export type Row = TotalRow | SingleRow
export type SingleRow = StandardSingleRow | PhraseLevelDisjunctionRow

export type TotalRow = RowBase & {
  id: "row_total"
}

/** A row of frequencies for a given set of attribute values */
export type StandardSingleRow = RowBase & {
  /** HTML representations of each attribute value */
  formattedValue: Record<string, string>
  /** Plain-text representations of each attribute value */
  plainValue: Record<string, string>
  /** For each match token, a record of non-simplified attr values, e.g. ["foo:12", "foo:34"] */
  statsValues: Record<string, string[]>[]
}

/**
 * A statistics row where a disjunction in CQP should be on phrase level:
 * `[T1] [U1] | [T2] [U2]` instead of `[T1 | T2] [U1 | U2]`
 */
export type PhraseLevelDisjunctionRow = Omit<StandardSingleRow, "statsValues"> & {
  statsValues: Record<string, string[]>[][]
  isPhraseLevelDisjunction: true
}

export const isTotalRow = (row: Row): row is TotalRow => row.rowId === 0
export const isStandardSingleRow = (row: Row): row is StandardSingleRow =>
  !isTotalRow(row) && !("isPhraseLevelDisjunction" in row)
export const isPhraseLevelDisjunctionRow = (row: Row): row is PhraseLevelDisjunctionRow =>
  !isTotalRow(row) && "isPhraseLevelDisjunction" in row

export type RowBase = {
  rowId: number
  /** Frequency counts keyed by uppercase corpus id */
  count: Record<string, AbsRelSeq>
  total: AbsRelSeq
}

export type Dataset = Row[]

export type AbsRelSeq = [number, number]
