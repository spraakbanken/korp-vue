import type { QueryParams } from "../types/query"
import { QueryProxyBase, type QueryData } from "./QueryProxyBase"

export class ExampleProxy extends QueryProxyBase {
  constructor(
    readonly corpusIds: string[],
    readonly cqps: string[],
    readonly defaultWithin?: string,
  ) {
    super()
  }

  protected buildParams(
    page: number,
    hpp: number,
    reuseCounts = false,
    isReading = false,
  ): QueryParams {
    // Split the cqp list to a primary `cqp` and subsequent `cqp2` etc.
    const cqp = this.cqps[0]
    const cqpN = Object.fromEntries(this.cqps.map((cqp, i) => [`cqp${i + 1}`, cqp]).slice(1))

    const params = this.buildParamsBase(this.corpusIds, cqp, hpp, {
      defaultWithin: this.defaultWithin,
      reuseCounts,
      isReading,
      page,
    })

    return {
      ...params,
      ...cqpN,
      expand_prequeries: false,
    }
  }

  async makeRequest(
    page: number,
    hpp: number,
    reuseCounts = false,
    isReading = false,
  ): Promise<QueryData> {
    const params = this.buildParams(page, hpp, reuseCounts, isReading)
    const data = await this.send(params)
    return QueryProxyBase.processData(data)
  }
}
