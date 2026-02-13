import { fill } from "lodash-es"
import type { ApiKwic } from "../backend/types"
import { isCorpusHeading, isKwic, type CorpusHeading, type Row } from "./kwic"
import type { QueryParams } from "../backend/types/query"
import type { RelationsSentencesParams } from "../backend/types/relations-sentences"
import { locObj } from "../i18n"

export type ExportType = "kwic" | "annotations"

// The annotations option is not available for parallel
type AnnotationsRow = ApiKwic | CorpusHeading

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

  const headers = Object.keys(firstTokensRow.tokens[0]!).filter(
    (val) =>
      val.indexOf("_") !== 0 && val !== "structs" && val !== "$$hashKey" && val !== "position",
  )

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
          newRow.push(token[field])
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
      const leftContext: string[] = []
      const match: string[] = []
      const rightContext: string[] = []

      if (row.match instanceof Array) {
        // the user has searched "not-in-order" and we cannot have a left, match and right context for the download
        // put all data in leftContext
        for (const token of row.tokens) {
          leftContext.push(token.word)
        }
      } else {
        for (const token of row.tokens.slice(0, row.match.start)) {
          leftContext.push(token.word)
        }
        for (const token of row.tokens.slice(row.match.start, row.match.end)) {
          match.push(token.word)
        }
        for (const token of row.tokens.slice(row.match.end, row.tokens.length)) {
          rightContext.push(token.word)
        }
      }

      const structs: string[] = []
      for (const attrName in row.structs) {
        if (!structHeaders.includes(attrName)) {
          structHeaders.push(attrName)
        }
      }
      for (const attrName of structHeaders) {
        if (row.structs && attrName in row.structs) {
          structs.push(row.structs[attrName])
        } else {
          structs.push("")
        }
      }
      const newRow: TableRow = [
        corpus,
        row.match instanceof Array
          ? row.match.map((match) => match.position).join(", ")
          : row.match.position,
        leftContext.join(" "),
        match.join(" "),
        rightContext.join(" "),
      ].concat(structs)
      res.push(newRow)
    } else {
      // parallell mode does not have matches or structs for the linked sentences
      // current wordaround is to add all tokens to the left context
      res.push(["", "", row.tokens.map((token) => token.word).join(" "), "", ""])
    }
  }

  const headers = ["corpus", "match_position", "left context", "match", "right_context"].concat(
    structHeaders,
  )
  res.unshift(headers)

  res.push(emptyRow(headers.length))
  for (const row of padRows(searchInfo, headers.length)) {
    res.push(row)
  }

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
