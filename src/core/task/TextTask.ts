import { TaskBase } from "./TaskBase"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { massageData, type KwicRow } from "../kwic/kwic"
import { korpRequest } from "../backend/common"

export class TextTask extends TaskBase<KwicRow> {
  constructor(
    readonly corpus: Corpus,
    readonly textId: string,
  ) {
    super()
  }

  async send(): Promise<KwicRow> {
    const corpusId = this.corpus.id.toUpperCase()

    const show = Object.keys(this.corpus.attributes)
    const showStruct = Object.keys(this.corpus["struct_attributes"])

    // _head and _tail are needed for all corpora, so that Korp will know what whitespace to use
    show.push("_head", "_tail")

    const params = {
      corpus: corpusId,
      cqp: `[_.text__id = "${this.textId}" & lbound(text)]`,
      context: corpusId + ":1 text",
      show: show.join(),
      show_struct: showStruct.join(),
      within: corpusId + ":text",
      start: 0,
      end: 0,
    }

    const data = await korpRequest("query", params)

    // The data is just one long KWIC row.
    const kwic = massageData(data.kwic)[1] as KwicRow

    kwic.tokens.forEach((token) => {
      token._match = token._matchSentence = false
    })
    return kwic
  }
}
