import { QueryProxyBase, type QueryData, type QueryParamOptions } from "./QueryProxyBase"
import type { QueryParams } from "../types/query"
import { corpusSelection } from "@/core/corpora/corpusListing"

export class KwicProxy extends QueryProxyBase {
  protected buildParams(cqp: string, hpp: number, options: QueryParamOptions): QueryParams {
    const corpusIds = corpusSelection.getIds()
    const params = this.buildParamsBase(corpusIds, cqp, hpp, options)

    return {
      ...params,
      incremental: !options.reuseCounts,
    }
  }

  async makeRequest(cqp: string, hpp: number, options: QueryParamOptions): Promise<QueryData> {
    const params = this.buildParams(cqp, hpp, options)
    const data = await this.send(params)
    return QueryProxyBase.processData(data)
  }
}
