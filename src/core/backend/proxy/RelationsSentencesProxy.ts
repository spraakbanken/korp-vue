import { corpusListing } from "@/core/corpora/corpusListing"
import { pageToRange } from "../common"
import { QueryProxyBase, type QueryData } from "./QueryProxyBase"
import ProxyBase from "./ProxyBase"

export class RelationsSentencesProxy extends ProxyBase<"relations_sentences"> {
  protected readonly endpoint = "relations_sentences"

  async makeRequest(source: string, page: number, hpp: number): Promise<QueryData> {
    const { start, end } = pageToRange(page || 0, hpp)

    const data = await this.send({
      source,
      start,
      end,
      ...corpusListing.buildShowParams(),
    })

    return QueryProxyBase.processData(data)
  }
}
