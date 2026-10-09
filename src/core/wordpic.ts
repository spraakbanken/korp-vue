import { isEqual, once } from "lodash-es"
import type { WordPictureDef, WordPictureDefItem } from "./config/instanceConfig.types"
import { getWordPictureConfig } from "./config"
import { Lemgram } from "./lemgram"
import { isCqpToken, type CqpQuery } from "./cqp/cqp.types"
import { parse } from "./cqp/cqp"
import { regescape, unregescape } from "./util"
import type { RelationRow, TermType } from "./backend/korp-api"

export type WordQuery = {
  type: TermType
  word: string
}

export type WordPictureData = WordPictureSection[]

export type WordPictureSection = {
  config: WordPictureDef[]
  heading: WordPictureSectionHeading
  tables: WordPictureTable[]
  max: number
}

export type WordPictureSectionHeading = { word: string; pos: string }

export type WordPictureTable = {
  config: WordPictureDef
  index: number
  columns: WordPictureColumn[]
  columnsBefore: WordPictureColumn[]
  columnsAfter: WordPictureColumn[]
  max: number
}

export type WordPictureColumn = {
  config: WordPictureDefItem
  rel: string
  rows: MatchedRelation[]
}

export type MatchedRelation = RelationRow & {
  /** True if the search word matches `dep` instead of `head`. */
  reverse: boolean
  /** Copy of `head` or `dep`, whichever matches the search word. */
  match: string
  match_pos: string
  /** Copy of `head` or `dep`, whichever doesn't match the search word. */
  other: string
  other_pos: string
  /** Copy of `depextra` if the search word matches `head` – a preposition or other string to show together with the related word */
  prefix?: string
}

/** Parse and check if a query can be used for word picture. */
export function parseWordQuery(cqp: string): WordQuery {
  let tokens: CqpQuery
  try {
    tokens = parse<CqpQuery>(cqp)
  } catch (error) {
    throw new RelationsParseError(String(error))
  }

  if (tokens.length != 1 || !isCqpToken(tokens[0]))
    throw new RelationsParseError("Must be single token")
  const conditions = tokens[0].and_block
  if (conditions[0]?.length != 1) throw new RelationsParseError("Must have a single condition")
  const condition = conditions[0][0]!

  const isWord = condition.type == "word" && condition.op == "="
  const isLemgram = condition.type == "lex" && condition.op == "contains"
  if (!isWord && !isLemgram) throw new RelationsParseError(`Attribute/operator not allowed`)

  if (!condition.val) throw new RelationsParseError("Condition value must not be empty")

  if (condition.val != regescape(unregescape(condition.val)))
    throw new RelationsParseError("Condition value must not contain regex patterns")

  return {
    type: isWord ? "word" : "lexeme",
    word: condition.val as string,
  }
}

export class WordPicture {
  readonly config = getWordPictureConfig()
  readonly items: Record<string, MatchedRelation[]> = {}
  readonly headings: WordPictureSectionHeading[] = []

  constructor(
    readonly query: string,
    readonly type: TermType,
    itemsRaw: RelationRow[],
  ) {
    const convertItem = (item: RelationRow): MatchedRelation | undefined => {
      const { head, head_pos, dependent, dependent_pos, dependent_extra } = item
      if (query == head)
        return {
          ...item,
          reverse: false,
          match: head,
          match_pos: head_pos,
          other: dependent,
          other_pos: dependent_pos,
          prefix: dependent_extra,
        }
      if (query == dependent)
        return {
          ...item,
          reverse: true,
          match: dependent,
          match_pos: dependent_pos,
          other: head,
          other_pos: head_pos,
        }
      console.warn("Unmatched relations item", item)
    }

    for (const itemRaw of itemsRaw) {
      const item = convertItem(itemRaw)
      if (!item) continue
      const { match, match_pos: matchpos, relation, reverse } = item
      // Skip relations that are not configured
      if (!this.config[matchpos]) continue
      // Store items by category
      const id = this.getColumnId(matchpos, relation, reverse)
      this.items[id] ??= []
      this.items[id].push(item)
      // Store distinct section headings
      const heading = { word: match, pos: matchpos }
      if (!this.headings.find((h) => isEqual(h, heading))) this.headings.push(heading)
    }
  }

  getData: () => WordPictureData = once(() => {
    const data = this.headings.map((heading) => {
      const config = this.config[heading.pos]!
      const tables: WordPictureTable[] = config.map((config, index) => {
        // Split data columns into before and after the "_" placeholder in the config
        const columnsBefore: WordPictureColumn[] = []
        const columnsAfter: WordPictureColumn[] = []
        let bin = columnsBefore
        for (const col of config) {
          if (col == "_") bin = columnsAfter
          else {
            const id = this.getColumnId(heading.pos, col.rel, !!col.field_reverse)
            const rows = this.items[id]
            if (rows) bin.push({ config: col, rel: col.rel, rows })
          }
        }
        const columns = [...columnsBefore, ...columnsAfter]
        const max = Math.max(0, ...columns.map((col) => col.rows.length))
        return { config, index, columns, columnsBefore, columnsAfter, max }
      })
      const max = Math.max(...tables.map((table) => table.max))
      return { config, heading, tables, max }
    })
    // Remove sections with no rows (in case there is data that has no matching config)
    return data.filter((section) => section.max > 0)
  })

  getMaxColumnLength(): number {
    return Math.max(0, ...this.getData().map((section) => section.max))
  }

  /** Get a string for the params that identify a word picture column */
  getColumnId = (pos: string, rel: string, reverse: boolean) =>
    `${pos}${reverse ? "+" : "-"}${rel}`;

  /** Create listing of full data, suitable for CSV export. */
  *generateCsv(): Generator<string[]> {
    const fields: (keyof MatchedRelation)[] = [
      "head",
      "head_pos",
      "dependent",
      "dependent_pos",
      "relation",
      "dependent_extra",
      "freq",
      "mi",
    ]
    // Header row
    yield fields

    // Data rows
    for (const key of Object.keys(this.items)) {
      for (const relation of this.items[key]!) {
        yield fields.map((field) => String(relation[field] || ""))
      }
    }
  }
}

/** Format a word or lemgram as HTML */
export function formatWordOrLemgram(
  word: string,
  pos: string,
  t: (key: string) => string,
  showPos = false,
): string {
  const lemgram = Lemgram.parse(word)
  if (lemgram) return lemgram.toHtml(t, !showPos)
  // Not a lemgram, return word, optionally with POS
  return showPos ? `${word} (${t(`pos.${pos.toLowerCase()}`)})` : word
}

export class RelationsParseError extends Error {}
