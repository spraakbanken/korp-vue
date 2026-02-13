import { downloadFile } from "@/core/util"

export type CsvType = keyof typeof CSV_TYPES

/** CSV types to allow */
export const CSV_TYPES = {
  comma: { delimiter: ",", display: ",", ext: "csv", mime: "text/csv" },
  tab: { delimiter: "\t", display: "⇥", ext: "tsv", mime: "text/tab-separated-values" },
}

/** Create a CSV file and trigger a download */
export async function downloadCsvFile(
  name: string,
  rows: Iterable<(string | number)[]>,
  type: CsvType,
) {
  const { delimiter, ext, mime } = CSV_TYPES[type]
  const csv = writeCsv([...rows], delimiter)
  downloadFile(csv, `korp-${name}.${ext}`, mime)
}

/** Transform a 2D array of values into a CSV string */
export const writeCsv = (rows: (string | number)[][], delimiter: string): string =>
  rows.map((row) => convertRow(row, delimiter)).join("\n")

const convertRow = (row: (string | number)[], delimiter: string): string =>
  row.map((value) => escapeValue(value, delimiter)).join(delimiter)

const escapeValue = (value: string | number, delimiter: string): string | number =>
  typeof value == "string" &&
  (value.includes(delimiter) || value.includes('"') || value.includes("\n"))
    ? `"${value.replace(/"/g, '""')}"`
    : value
