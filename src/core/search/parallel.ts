import { difference, groupBy, uniq } from "lodash-es"
import type { CorpusSetParallel } from "../corpora/CorpusSetParallel"
import { corpusSelection } from "../corpora/corpusListing"
import { expandCqp } from "../cqp/cqp"
import settings from "../config"

export type ParallelQuery = {
  lang: string
  cqp: string
  negative?: boolean
}

export function getParallelCqp(queries: ParallelQuery[]) {
  const cl = corpusSelection as CorpusSetParallel
  const langs = queries.map((query) => query.lang)
  const linkedCorpora = cl.getLinksFromLangs(langs).flat(2)
  const [head, ...tail] = queries

  const headCqp = expandCqp(head.cqp)
  const tailCqps = tail.map((langobj, i) => {
    const prevLangs = langs.slice(0, i)
    const corpora = linkedCorpora.filter((corpus) => !prevLangs.includes(corpus.lang))
    const langMapping = groupBy(corpora, "lang")
    const linkedCorpus = langMapping[langobj.lang]
      .map((corpus) => corpus.id.toUpperCase())
      .join("|")

    const expanded = expandCqp(langobj.cqp)
    const neg = langobj.negative ? "!" : ""
    return `:LINKED_CORPUS:${linkedCorpus} ${neg} ${expanded}`
  })

  return headCqp + tailCqps.join("")
}

export function getEnabledLangs(
  corpusSet: CorpusSetParallel,
  queries: ParallelQuery[],
  i?: number,
) {
  function getLinkedLangs(lang: string) {
    const corpora = corpusSet.getLinksFromLangs([lang]).flat(2)
    return uniq(corpora.map((corpus) => corpus.lang))
  }

  if (!i) {
    queries[0].lang ??= settings.start_lang!
    return getLinkedLangs(settings.start_lang!)
  }

  const langs = queries.map((query) => query.lang)
  if (i) delete langs[i]

  const firstlang = queries[0]?.lang || settings.start_lang!
  const other = getLinkedLangs(firstlang)
  const langResult = difference(other, langs)

  if (i && queries[i] && !queries[i].lang) {
    queries[i].lang = langResult[0]
  }
  return langResult
}
