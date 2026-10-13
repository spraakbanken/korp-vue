import { unregescape } from "@/core/util"
import { WordPicture, type WordQuery } from "@/core/wordpic"
import type { ClientResponse } from "../client.types"
import type { DependencyRelationMeasure } from "../korp-api"
import { EndpointBase } from "./EndpointBase"

export type DependencyRelationsParams = {
  corpora: string[]
  query: WordQuery
  sort: DependencyRelationMeasure
}

export class DependencyRelationsEndpoint extends EndpointBase<
  "/dependency-relations",
  DependencyRelationsParams,
  WordPicture
> {
  protected readonly path = "/dependency-relations"

  processParams(params: DependencyRelationsParams) {
    const { corpora, query, sort } = params
    const { type, word } = query

    return Promise.resolve({
      term: type == "lexeme" ? unregescape(word) : word,
      term_type: type,
      corpora,
      sort,
      max_results: 1000,
    })
  }

  processResponse(data: ClientResponse<"/dependency-relations">): Promise<WordPicture> {
    const { term, term_type } = this.getParams()!
    const result = new WordPicture(term, term_type!, data.relations!)
    return Promise.resolve(result)
  }
}
