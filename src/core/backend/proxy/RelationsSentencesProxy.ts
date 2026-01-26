import { corpusListing } from "@/core/corpora/corpusListing"
import { pageToRange } from "../common"
import type { RelationsSentencesResponse } from "../types/relations-sentences"
import ProxyBase from "./ProxyBase"

export class RelationsSentencesProxy extends ProxyBase<"relations_sentences"> {
  protected readonly endpoint = "relations_sentences"

  makeRequest(source: string, page: number, hpp: number): Promise<RelationsSentencesResponse> {
    const { start, end } = pageToRange(page || 0, hpp)

    return this.send({
      source,
      start,
      end,
      ...corpusListing.buildShowParams(),
    })
  }
}
