import { TaskBase } from "./TaskBase"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { massageData, type KwicRow } from "../kwic/kwic"
import { korpRequest } from "../backend/common"
import { CorpusSet } from "../corpora/CorpusSet"

export class TextTask extends TaskBase<KwicRow> {
  readonly corpusSet: CorpusSet
  constructor(
    readonly corpus: Corpus,
    readonly textId: string,
  ) {
    super()
    this.corpusSet = new CorpusSet([corpus])
  }

  async send(): Promise<KwicRow> {
    const showParams = this.corpusSet.buildShowParams()
    // Include whitespace
    showParams.show += ",_head,_tail"

    const params = {
      corpus: this.corpus.id.toUpperCase(),
      cqp: `[_.text__id = "${this.textId}" & lbound(text)]`,
      default_context: "1 text",
      ...showParams,
      end: 0,
    }

    const data = await korpRequest("query", params)

    // The data is just one long KWIC row.
    const kwic = massageData(data.kwic)[1] as KwicRow
    // Remove match info
    kwic.tokens.forEach((token) => (token._match = token._matchSentence = false))
    return kwic
  }
}
