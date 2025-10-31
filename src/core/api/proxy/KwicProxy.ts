import type { Store } from "@/core/model/store"
import { QueryProxyBase } from "./QueryProxyBase"
import type { QueryParams, QueryResponse } from "../types/query"
import { corpusSelection } from "@/core/corpora/corpusListing"

export class KwicProxy extends QueryProxyBase {
  constructor(protected readonly store: Store) {
    super()
  }

  protected buildParams(cqp: string, isPaging = false): QueryParams {
    const corpusIds = corpusSelection.getIds()
    const options = {
      isPaging,
      isReading: this.store.reading_mode,
      defaultWithin: this.store.within,
      page: this.store.page,
    }
    const params = this.buildParamsBase(corpusIds, cqp, this.store.hpp, options)

    return {
      ...params,
      incremental: true,
      in_order: this.store.in_order ? undefined : false,
      random_seed: this.store.random_seed,
      sort: this.store.sort || undefined,
    }
  }

  makeRequest(cqp: string, isPaging = false): Promise<QueryResponse> {
    const params = this.buildParams(cqp, isPaging)
    return this.send(params)
  }
}
