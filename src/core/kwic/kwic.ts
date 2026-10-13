import { mapKeys } from "lodash-es"
import type { LangString } from "../model/locale"
import settings from "../config"
import { splitFirst } from "../util"
import type { KwicRow as ApiKwicRow } from "../backend/korp-api"

export type Row = KwicRow | LinkedKwicRow | CorpusHeading

/** Row with search hits */
export type KwicRow = {
  /** Unique within this KWIC page */
  id: string
  corpus: string
  /** An object for each token in the context, with attribute values for that token */
  tokens: KwicToken[]
  /** Attribute values for the context (e.g. sentence) */
  structs: Record<string, string | null>
  /** Specifies the position of the match in the context. If `in_order` is false, `match` will consist of a list of match objects, one per highlighted word */
  match: ApiKwicRow["matches"]
  /** The id of a linked row, if any */
  link?: string
}

/** Row from a secondary language in parallel mode. */
export type LinkedKwicRow = {
  /** Unique within this KWIC page */
  id: string
  tokens: LinkedKwicToken[]
  isLinked: true
  corpus: string
  /** The id of the corresponding main row */
  link: string
}

/** A row introducing the next corpus in the hit listing. */
export type CorpusHeading = {
  corpus: string
  newCorpus: LangString
  noContext?: boolean
}

export type KwicToken = {
  /** Unique within this KWIC page */
  id: string
  word: string
  position: number
  attrs: Record<string, string | null>
  _match: boolean
  _matchSentence: boolean
}

export type LinkedKwicToken = {
  /** Unique within this KWIC page */
  id: string
  word: string
  position: number
  attrs: Record<string, string | null>
}

/** A token and its context */
export type RowToken = KwicRowToken | LinkedKwicRowToken
export type KwicRowToken = { row: KwicRow; token: KwicToken }
export type LinkedKwicRowToken = { row: LinkedKwicRow; token: LinkedKwicToken }

export const isKwic = (row: Row): row is KwicRow => "structs" in row
export const isLinkedKwic = (row: Row): row is LinkedKwicRow => "isLinked" in row
export const isCorpusHeading = (row: Row): row is CorpusHeading => "newCorpus" in row

export const isKwicRowToken = (rowToken: RowToken): rowToken is KwicRowToken => isKwic(rowToken.row)
export const isLinkedKwicRowToken = (rowToken: RowToken): rowToken is LinkedKwicRowToken =>
  isLinkedKwic(rowToken.row)

export type HitsPictureItem = {
  page: number
  relative: number
  abs: number
  rtitle: LangString
}

/** Transform backend KWIC data to be easier to use in frontend code */
export function massageData(rows: ApiKwicRow[]): Row[] {
  let counter = 1
  const getId = () => `kwic${counter++}`

  // Track what corpus the previous row belonged to, in order to add a heading row when it changes
  let prevCorpus = ""
  const output: Row[] = []

  for (const row of rows) {
    const corpusId = row.corpus
    const [mainCorpusId, id] = settings.parallel ? splitFirst("|", corpusId) : [corpusId, corpusId]

    const corpus = settings.corpora[id]!

    // At the start of each new corpus, add a row with the corpus title
    if (id != prevCorpus) {
      const heading: CorpusHeading = {
        corpus: id,
        newCorpus: corpus.title,
        noContext: Object.keys(corpus.context).length === 1,
      }
      output.push(heading)
    }

    const [matchSentenceStart, matchSentenceEnd] = findMatchSentence(row)
    const isMatchSentence = (i: number): boolean => matchSentenceStart <= i && i <= matchSentenceEnd

    // When using `in_order=false`, there are multiple matches
    // Otherwise, cast single match to array for consistency
    const isMatch = (i: number) => row.matches.some(({ start, end }) => start <= i && i < end)

    // Copy struct attributes to tokens
    /** Currently open structural elements (e.g. `<ne>`) */
    const currentStruct: Record<string, Record<string, string>> = {}

    // Process the tokens of this row
    const tokens: KwicToken[] = row.tokens.map((token, i) => {
      // For each new structural element this token opens, add it to currentStruct
      for (const structItem of token.structs?.open || []) {
        // structItem is an object with a single key
        const [key, struct] = Object.entries(structItem)[0]!

        // Store structural attributes with a qualified name e.g. "ne_type"
        currentStruct[key] = mapKeys(struct, (val, subkey) => `${key}_${subkey}`)

        // Add a fallback id, perhaps primarily useful for identifying sentences
        currentStruct[key][`${key}_id`] ??= getId()
      }

      // Copy structural attributes
      // The keys of currentStruct are included in the names of each attribute
      const structAttrs: Record<string, string> = Object.assign({}, ...Object.values(currentStruct))

      // For each struct this token closes, remove it from currentStruct
      for (const structItem of token.structs?.close || []) delete currentStruct[structItem]

      // Output token
      const tokenOut: KwicToken = {
        id: getId(),
        position: i,
        // Copy positional attributes
        attrs: {
          ...token.attributes,
          ...structAttrs,
        },
        word: token.word || "—",
        _match: isMatch(i),
        _matchSentence: isMatchSentence(i),
      }
      return tokenOut
    })

    // Add normal KWIC row
    const rowOut: KwicRow = {
      id: getId(),
      corpus: mainCorpusId,
      tokens,
      structs: { ...row.structs },
      match: row.matches,
    }
    output.push(rowOut)

    // In parallel mode, create linked row
    if (row.aligned) {
      const [corpus, tokensAligned] = Object.entries(row.aligned)[0]!

      const tokens = tokensAligned.map((token, i) => ({
        id: getId(),
        word: token.word || "—",
        position: i,
        attrs: token.attributes,
      }))

      const id = getId()
      rowOut.link = id

      // Add linked KWIC row
      output.push({
        id,
        corpus,
        tokens,
        isLinked: true,
        link: rowOut.id,
      })
    }

    prevCorpus = id
  }

  return output
}

/** Find span of sentence containing the match */
// This is used in context mode to highlight the sentence.
function findMatchSentence(row: ApiKwicRow): [number, number] {
  let start = row.matches[0]!.start
  let end = row.matches[row.matches.length - 1]!.end

  for (; start >= 0; start--) {
    const sentenceOpen = (row.tokens[start].structs?.open || []).some((attr) => attr.sentence)
    if (sentenceOpen) break
  }

  for (; end < row.tokens.length; end++) {
    const closed = row.tokens[end].structs?.close || []
    if (closed.includes("sentence")) break
  }

  return [start, end]
}

/** Check if two row-token tuples are equal */
export function isRowTokenEqual(a?: RowToken, b?: RowToken): boolean {
  if (!a || !b) return false
  return a.row.id == b.row.id && a.token.id == b.token.id
}

/** Identify tokens that should not be preceded by space */
export const isPunctuation = (word: string): boolean => {
  const punct = [",", ".", ";", ":", "!", "?", "..."]
  return punct.includes(word)
}

/** Convert escaped whitespaces "\s", "\n" and "\t" */
export const parseWhitespace = (str?: string): string =>
  str?.replace(/\\s/g, " ").replace(/\\n/g, "\n").replace(/\\t/g, "\t") || ""
