import { corpusSelection } from "@/core/corpora/corpusListing"
import { pageToRange } from "../common"
import type { RelationsSentencesResponse } from "../types/relations-sentences"
import ProxyBase from "./ProxyBase"

export class RelationsTimeSentencesProxy extends ProxyBase<"relations_time_sentences"> {
  protected readonly endpoint = "relations_time_sentences"

  makeRequest(source: string, page: number, hpp: number): Promise<RelationsSentencesResponse> {
    const { start, end } = pageToRange(page || 0, hpp)

    return this.send({
      source,
      start,
      end,
      ...corpusSelection.buildShowParams(),
    })
  }
}
