import { clone, mapKeys, omit, pickBy, sum } from "lodash-es"
import type { ApiKwic, KwicMatch, Token } from "../backend/types"
import type { LangString } from "../model/locale"
import settings from "../config"
import { splitFirst } from "../util"
import { corpusListing } from "../corpora/corpusListing"

export type Row = KwicRow | LinkedKwicRow | CorpusHeading

/** Row with search hits */
export type KwicRow = {
  corpus: string
  /** An object for each token in the context, with attribute values for that token */
  tokens: KwicToken[]
  /** Attribute values for the context (e.g. sentence) */
  structs: Record<string, string | undefined>
  /** Specifies the position of the match in the context. If `in_order` is false, `match` will consist of a list of match objects, one per highlighted word */
  match: KwicMatch[]
  /** Hits from aligned corpora if available, otherwise omitted */
  aligned?: {
    [linkedCorpusId: `${string}-${string}`]: Token[]
  }
}

/** Row from a secondary language in parallel mode. */
export type LinkedKwicRow = {
  tokens: LinkedKwicToken[]
  isLinked: true
  corpus: string
}

/** A row introducing the next corpus in the hit listing. */
export type CorpusHeading = {
  corpus: string
  newCorpus: LangString
  noContext?: boolean
}

export type KwicToken = {
  word: string
  position: number
  _match: boolean
  _matchSentence: boolean
  _open_sentence: boolean
  _punct: boolean
} & {
  // [attr: string]: string | null
}

export type LinkedKwicToken = Token & {
  linkref: `${number}`
  _open_sentence?: boolean
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
export function massageData(rows: ApiKwic[]): Row[] {
  const punctArray = [",", ".", ";", ":", "!", "?", "..."]

  // Track what corpus the previous row belonged to, in order to add a heading row when it changes
  let prevCorpus = ""
  const output: Row[] = []

  for (const row of rows) {
    const corpusId = row.corpus.toLowerCase()
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
    const isMatchSentence = (i: number): boolean =>
      matchSentenceStart != undefined &&
      !!matchSentenceEnd &&
      matchSentenceStart <= i &&
      i <= matchSentenceEnd

    // When using `in_order=false`, there are multiple matches
    // Otherwise, cast single match to array for consistency
    const matches = !(row.match instanceof Array) ? [row.match] : row.match
    const isMatch = (i: number) => matches.some(({ start, end }) => start <= i && i < end)

    // Copy struct attributes to tokens
    /** Currently open structural elements (e.g. `<ne>`) */
    const currentStruct: Record<string, Record<string, string>> = {}

    // Process the tokens of this row
    const tokens: KwicToken[] = row.tokens.map((token, i) => {
      let openSentence = false

      // For each new structural element this token opens, add it to currentStruct
      for (const structItem of token.structs?.open || []) {
        // structItem is an object with a single key
        const structKey = Object.keys(structItem)[0]!
        if (structKey == "sentence") openSentence = true

        // Store structural attributes with a qualified name e.g. "ne_type"
        const rekeyed = mapKeys(structItem[structKey], (val, key) => `${structKey}_${key}`)
        currentStruct[structKey] = pickBy(rekeyed, (val, key) => key in corpus.attributes)
      }

      // Copy structural attributes
      // The keys of currentStruct are included in the names of each attribute
      const structAttrs: Record<string, string> = Object.assign({}, ...Object.values(currentStruct))

      // For each struct this token closes, remove it from currentStruct
      for (const structItem of token.structs?.close || []) delete currentStruct[structItem]

      // Output token
      const tokenOut: KwicToken = {
        // Copy positional attributes
        ...omit(token, ["structs"]),
        ...structAttrs,
        position: i,
        _match: isMatch(i),
        _matchSentence: isMatchSentence(i),
        _open_sentence: openSentence,
        _punct: punctArray.includes(token.word),
      }
      return tokenOut
    })

    // Add normal KWIC row
    output.push({
      corpus: mainCorpusId,
      tokens,
      structs: { ...row.structs },
      match: matches,
      aligned: row.aligned ? clone(row.aligned) : undefined,
    })

    if (row.aligned) {
      const [corpus, tokensAligned] = Object.entries(row.aligned)[0]!

      // just check for sentence opened, no other structs
      const tokens = tokensAligned.map((token) => {
        const opens = token.structs?.open?.map((item) => Object.keys(item)[0]!)
        return {
          ...token,
          _open_sentence: opens?.includes("sentence"),
        }
      })

      // Add linked KWIC row
      output.push({
        corpus,
        tokens,
        isLinked: true,
      })
    }

    prevCorpus = id
  }

  return output
}

/** Find span of sentence containing the match */
// This is used in reading mode (when free order is not used) to highlight the sentence.
function findMatchSentence(hitContext: ApiKwic): [number?, number?] {
  if (Array.isArray(hitContext.match)) return []
  const span: [number?, number?] = []
  const { start, end } = hitContext.match
  let decr = start
  let incr = end
  while (decr >= 0) {
    const token = hitContext.tokens[decr]
    const sentenceOpen = (token?.structs?.open || []).filter((attr) => attr.sentence)
    if (sentenceOpen.length > 0) {
      span[0] = decr
      break
    }
    decr--
  }
  while (incr < hitContext.tokens.length) {
    const token = hitContext.tokens[incr]
    const closed = token?.structs?.close || []
    if (closed.includes("sentence")) {
      span[1] = incr
      break
    }
    incr++
  }

  return span
}

export function calculateHitsPicture(
  corpusOrder: string[],
  corpusHits: Record<string, number>,
  pageSize: number,
): HitsPictureItem[] {
  const total = sum(Object.values(corpusHits))
  const items: HitsPictureItem[] = corpusOrder
    .map((id) => ({
      rtitle: corpusListing.get(id).title,
      relative: (corpusHits[id] || 0) / total,
      abs: corpusHits[id] || 0,
      page: -1, // this is properly set below
    }))
    .filter((item) => item.abs > 0)

  // calculate which is the first page of hits for each item
  let index = 0
  items.forEach((item) => {
    item.page = Math.floor(index / pageSize)
    index += item.abs
  })

  return items
}
