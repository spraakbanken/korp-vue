import { corpusListing } from "../corpora/corpusListing"
import type { ConcordanceData } from "./ConcordanceEndpoint"
import { EndpointBase } from "./EndpointBase"
import type { RelationsSentencesResponse } from "./korp-api"

export type DependencyRelationsSentencesParams = {
  context?: boolean
  corpora: string[]
  limit: number
  page?: number
  sources: string[]
}

export class DependencyRelationsSentencesEndpoint extends EndpointBase<
  "/dependency-relations/sentences",
  DependencyRelationsSentencesParams,
  ConcordanceData
> {
  protected readonly path = "/dependency-relations/sentences"

  processParams(params: DependencyRelationsSentencesParams) {
    const { context, corpora, limit, page = 0, sources } = params

    const cl = corpusListing.pick(corpora)

    return Promise.resolve({
      ...cl.getContextParams(context ? "context" : "kwic"),
      ...cl.buildConcordanceAttributeParams(),
      limit,
      offset: limit * page,
      sources,
    })
  }

  processResponse(data: RelationsSentencesResponse) {
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
