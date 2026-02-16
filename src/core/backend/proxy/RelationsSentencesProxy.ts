import { corpusListing } from "@/core/corpora/corpusListing"
import { pageToRange } from "../common"
import type { QueryData } from "./QueryProxyBase"
import ProxyBase from "./ProxyBase"
import { massageData } from "@/core/kwic/kwic"

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

    // TODO Deduplicate with QueryProxyBase
    const kwic = massageData(data.kwic)
    const distribution = data.corpus_order.map((corpus) => ({
      corpus,
      hits: data.corpus_hits[corpus] || 0,
    }))
    return {
      distribution,
      hits: data.hits,
      kwic,
    }
  }
}
