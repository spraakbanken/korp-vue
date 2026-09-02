import { difference, groupBy } from "lodash-es"
import type { CorpusSetParallel } from "../corpora/CorpusSetParallel"
import { corpusSelection } from "../corpora/corpusListing"
import { parse, stringify } from "../cqp/cqp"
import settings from "../config"
import type { CqpQuery } from "../cqp/cqp.types"

/** A parallel search query: query tied to a language */
export type ParallelQuery = {
  lang: string
  query: CqpQuery
  negative?: boolean
}

/** Prefix to negate a parallel CQP query */
export const NEG_PREFIX = "! "

/**
 * Build a CQP string from parallel search queries.
 *
 * The parallel CQP syntax is Korp-specific, not directly compatible with CWB.
 */
export function getParallelCqp(queries: ParallelQuery[]) {
  const cl = corpusSelection as CorpusSetParallel
  const langs = queries.map((query) => query.lang)
  const linkedCorpora = cl.getLinksFromLangs(langs).flat(2)
  const [head, ...tail] = queries
  if (!head) throw new Error("At least one query is required")

  const headCqp = stringify(head.query, true)
  const tailCqps = tail.map((query, i) => {
    const prevLangs = langs.slice(0, i)
    const corpora = linkedCorpora.filter((corpus) => !prevLangs.includes(corpus.lang))
    const corporaByLang = groupBy(corpora, "lang")
    // TODO Gives undefined when loading query from URL
    const linkedCorpus = corporaByLang[query.lang]
      ?.map((corpus) => corpus.id.toUpperCase())
      .join("|")

    const pcqp = stringifyParallel(query, true)
    return `:LINKED_CORPUS:${linkedCorpus} ${pcqp}`
  })

  return headCqp + tailCqps.join("")
}

/** Parse a possibly negated parallel CQP */
export function parseParallel(lang: string, pcqp: string): ParallelQuery {
  const negative = pcqp.startsWith(NEG_PREFIX)
  const cqp = negative ? pcqp.slice(NEG_PREFIX.length) : pcqp
  const query = parse<CqpQuery>(cqp)
  return { lang, negative, query }
}

/** Stringify a parallel query */
export function stringifyParallel(query: ParallelQuery, expand?: boolean): string {
  const neg = query.negative ? NEG_PREFIX : ""
  const cqp = stringify(query.query, expand)
  return `${neg}${cqp}`
}

/** Calculate what languages are available to choose for each query */
export function getAvailableLangs(corpusSet: CorpusSetParallel, queries: ParallelQuery[]) {
  const langLists = [
    // For the first query, allow linked languages of the starting language
    corpusSet.getLinkedLangs(settings.start_lang!),
  ]

  if (!queries[0]) throw new Error("At least one query is required")
  const usedLangs = queries.map((query) => query.lang)
  const linkedLangs = corpusSet.getLinkedLangs(queries[0].lang)

  // For subsequent queries, allow linked languages of the first query language, excluding already chosen languages
  for (const query of queries.slice(1)) {
    // Don't exclude this query's currently chosen language
    const otherUsedLangs = usedLangs.filter((lang) => lang != query.lang)
    langLists.push(difference(linkedLangs, otherUsedLangs))
  }

  // For a new query, allow linked languages not yet used
  langLists.push(difference(linkedLangs, usedLangs))

  return langLists
}
