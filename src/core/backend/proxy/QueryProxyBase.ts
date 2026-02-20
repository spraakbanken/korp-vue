import { corpusListing } from "@/core/corpora/corpusListing"
import { pageToRange } from "../common"
import type { QueryParams, QueryResponse } from "../types/query"
import ProxyBase from "./ProxyBase"
import { getDefaultWithin } from "@/core/config"
import { expandCqp } from "@/core/cqp/cqp"
import type { ApiKwic } from "../types"

export type QueryParamOptions = {
  isPaging?: boolean
  page?: number
  isReading?: boolean
  defaultWithin?: string
}

export type QueryData = {
  hits: number
  kwic: ApiKwic[]
  distribution: HitsDistribution[]
}

export type HitsDistribution = {
  corpus: string
  hits: number
}

export abstract class QueryProxyBase extends ProxyBase<"query"> {
  protected readonly endpoint = "query"
  /** Cache token for quicker paging requests. */
  protected queryData?: string

  protected buildParamsBase(
    corpusIds: string[],
    cqp: string,
    hpp: number,
    options: QueryParamOptions,
  ): QueryParams {
    if (!options.isPaging) this.queryData = undefined
    const cl = corpusListing.pick(corpusIds)
    const defaultWithin = options.defaultWithin || getDefaultWithin()

    return {
      corpus: cl.stringify(),
      cqp: expandCqp(cqp),
      default_within: defaultWithin,
      within: cl.getWithinParam(defaultWithin),
      ...cl.getContextParams(!!options.isReading),
      ...cl.buildShowParams(),
      query_data: this.queryData,
      ...pageToRange(options.page || 0, hpp),
    }
  }

  protected async send(params: QueryParams): Promise<QueryResponse> {
    const data = await super.send(params)
    this.queryData = data.query_data
    return data
  }

  static processData(data: QueryResponse): QueryData {
    const distribution = data.corpus_order.map((corpus) => ({
      corpus,
      hits: data.corpus_hits[corpus] || 0,
    }))
    return {
      distribution,
      hits: data.hits,
      kwic: data.kwic,
    }
  }
}
