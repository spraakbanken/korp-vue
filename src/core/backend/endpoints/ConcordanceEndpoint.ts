import { getDefaultWithin } from "@/core/config"
import { corpusListing } from "@/core/corpora/corpusListing"
import type { ConcordanceRequest, ConcordanceResponse, KwicRow } from "../korp-api"
import { EndpointBase } from "./EndpointBase"

export type ConcordanceParams = {
  corpora: string[]
  cqp: string[]
  defaultWithin?: string
  display?: "kwic" | "context" | "text"
  freeOrder?: boolean
  limit: number
  page?: number
  /** Enable to reuse the pagination state from the last request, causing backend to skip counting hits per corpora. */
  reuseCounts?: boolean
  randomSeed?: number
  sort?: ConcordanceRequest["sort"]
}

export type ConcordanceData = {
  distribution: HitsDistribution[]
  hits: number
  kwic: KwicRow[]
}

export type HitsDistribution = {
  corpus: string
  hits: number
}

export class ConcordanceEndpoint extends EndpointBase<
  "/concordance",
  ConcordanceParams,
  ConcordanceData
> {
  protected readonly path = "/concordance"
  protected paginationState?: string

  processParams(params: ConcordanceParams) {
    const {
      corpora,
      cqp,
      defaultWithin = getDefaultWithin(),
      display,
      freeOrder,
      limit,
      page = 0,
      reuseCounts,
      randomSeed,
      sort,
    } = params

    if (!reuseCounts) this.paginationState = undefined
    const cl = corpusListing.pick(corpora)

    return Promise.resolve({
      corpora,
      cqp,
      default_within: defaultWithin,
      expand_prequeries: cqp.length > 1 ? false : undefined,
      within: cl.getWithinParam(defaultWithin),
      ...cl.getContextParams(display),
      ...cl.buildConcordanceAttributeParams(display == "text"),
      free_order: freeOrder || undefined,
      random_seed: randomSeed,
      sort,
      pagination_state: this.paginationState,
      limit,
      offset: limit * page,
    })
  }

  processResponse(data: ConcordanceResponse) {
    this.paginationState = data.pagination_state

    // Reshape hit distribution as ordered list
    const distribution = data.corpus_order.map((corpus) => ({
      corpus,
      hits: data.hits_by_corpus[corpus] || 0,
    }))

    return Promise.resolve({
      distribution,
      hits: data.total_hits,
      kwic: data.kwic,
    })
  }
}
