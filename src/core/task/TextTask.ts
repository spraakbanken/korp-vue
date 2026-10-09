import { TaskBase } from "./TaskBase"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { ConcordanceEndpoint } from "../backend/ConcordanceEndpoint"
import { massageData, type KwicRow } from "../kwic/kwic"

export class TextTask extends TaskBase<KwicRow> {
  protected endpoint = new ConcordanceEndpoint()

  constructor(
    readonly corpus: Corpus,
    readonly textId: string,
  ) {
    super()
  }

  async send(): Promise<KwicRow> {
    const data = await this.endpoint.query({
      corpora: [this.corpus.id],
      cqp: [`[_.text__id = "${this.textId}" & lbound(text)]`],
      display: "text",
      limit: 1,
    })

    // The data is just one long KWIC row.
    const kwic = massageData(data.kwic)[1] as KwicRow
    // Remove match info
    kwic.tokens.forEach((token) => {
      token._match = false
      token._matchSentence = true
    })
    return kwic
  }

  abort() {
    this.endpoint.abort()
  }
}
