import { fill } from "lodash-es"
import { isCorpusHeading, isKwic, type CorpusHeading, type KwicRow, type Row } from "./kwic"
import type { QueryParams } from "../backend/types/query"
import type { RelationsSentencesParams } from "../backend/types/relations-sentences"
import { locObj } from "../i18n"

export type ExportType = "kwic" | "annotations"

// The annotations option is not available for parallel
type AnnotationsRow = KwicRow | CorpusHeading

type TableRow = (string | number)[]

type KwicParams = QueryParams | RelationsSentencesParams

const emptyRow = (length: number) => fill(new Array(length), "")

const padRows = (data: string[], length: number) =>
  data.map((value) => [value, ...emptyRow(length - 1)])

const isQueryParams = (params: KwicParams): params is QueryParams => "cqp" in params

function* createSearchInfo(requestInfo: KwicParams, totalHits: number) {
  if (isQueryParams(requestInfo)) {
    yield `## CQP query: ${requestInfo.cqp}`
    if (requestInfo.cqp2) yield `## CQP query 2: ${requestInfo.cqp2}`
    if (requestInfo.cqp3) yield `## CQP query 3: ${requestInfo.cqp3}`
    yield `## context: ${requestInfo.default_context}`
    yield `## within: ${requestInfo.default_within}`
    yield `## sorting: ${requestInfo.sort || "none"}`
  } else {
    yield `## CQP query: N/A`
  }
  yield `## start: ${requestInfo.start}`
  yield `## end: ${requestInfo.end}`
  yield `## Total hits: ${totalHits}`
}

function transformDataToAnnotations(data: AnnotationsRow[], searchInfo: string[]) {
  const firstTokensRow = data.find((row) => isKwic(row))!

  const headers = Object.keys(firstTokensRow.tokens[0]!.attrs)

  const columnCount = headers.length + 1
  let corpus
  const res = padRows(searchInfo, columnCount)
  res.push(["match"].concat(headers))
  for (const row of data) {
    if (isKwic(row)) {
      const textAttributes: string[] = []
      for (const attrName in row.structs) {
        const attrValue = row.structs[attrName]
        textAttributes.push(attrName + ': "' + attrValue + '"')
      }
      const hitInfo = emptyRow(columnCount)
      hitInfo[0] = `# ${corpus}; text attributes: ${textAttributes.join(", ")}`
      res.push(hitInfo)

      for (const token of row.tokens || []) {
        let match = ""
        for (const matchObj of [row.match].flat()) {
          if (token.position >= matchObj.start && token.position < matchObj.end) {
            match = "***"
            break
          }
        }
        const newRow = [match]
        for (const field of headers) {
          newRow.push(token.attrs[field]!)
        }
        res.push(newRow)
      }
    } else if (row.newCorpus) {
      corpus = locObj(row.newCorpus)
    }
  }

  return res
}

function transformDataToKWIC(data: Row[], searchInfo: string[]) {
  let corpus: string = ""
  const structHeaders: string[] = []
  const res: TableRow[] = []
  for (const row of data) {
    if (isCorpusHeading(row)) {
      corpus = locObj(row.newCorpus)
    } else if (isKwic(row)) {
      // Sort tokens into left context, match and right context
      // If multiple matches (free-order search) put everything in left context
      const { start, end } =
        row.match.length == 1 ? row.match[0]! : { start: row.tokens.length, end: row.tokens.length }

      const leftContext = row.tokens.slice(0, start).map((token) => token.word)
      const match = row.tokens.slice(start, end).map((token) => token.word)
      const rightContext = row.tokens.slice(end).map((token) => token.word)

      const structs: string[] = []
      for (const attrName in row.structs) {
        if (!structHeaders.includes(attrName)) {
          structHeaders.push(attrName)
        }
      }
      for (const attrName of structHeaders) {
        structs.push(row.structs[attrName] || "")
      }
      const newRow: TableRow = [
        corpus,
        row.match.map((match) => match.position).join(", "),
        leftContext.join(" "),
        match.join(" "),
        rightContext.join(" "),
        ...structs,
      ]
      res.push(newRow)
    } else {
      // parallell mode does not have matches or structs for the linked sentences
      // current wordaround is to add all tokens to the left context
      res.push(["", "", row.tokens.map((token) => token.word).join(" "), "", ""])
    }
  }

  const headers = [
    "corpus",
    "match_position",
    "left_context",
    "match",
    "right_context",
    ...structHeaders,
  ]
  res.unshift(headers)
  res.push(emptyRow(headers.length), ...padRows(searchInfo, headers.length))
  return res
}

export function transformData(
  dataType: "annotations" | "kwic",
  data: Row[],
  requestInfo: KwicParams,
  totalHits: number,
) {
  const searchInfo = [...createSearchInfo(requestInfo, totalHits)]
  if (dataType === "annotations") {
    return transformDataToAnnotations(data as AnnotationsRow[], searchInfo)
  }
  return transformDataToKWIC(data, searchInfo)
}
