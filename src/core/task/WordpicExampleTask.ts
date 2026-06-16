import type { QueryData } from "../backend/proxy/QueryProxyBase"
import { RelationsSentencesProxy } from "../backend/proxy/RelationsSentencesProxy"
import { RelationsTimeSentencesProxy } from "../backend/proxy/RelationsTimeSentencesProxy"
import type { CorpusSet } from "../corpora/CorpusSet"
import { TaskBase } from "./TaskBase"

export class WordpicExampleTask extends TaskBase<QueryData> {
  readonly isReadingInit = false // Context param is not supported by /relations_sentences
  readonly proxy: RelationsSentencesProxy | RelationsTimeSentencesProxy

  constructor(
    readonly corpora: CorpusSet,
    readonly source: string,
    readonly isTime = false,
  ) {
    super()
    this.proxy = isTime ? new RelationsTimeSentencesProxy() : new RelationsSentencesProxy()
  }

  abort(): void {
    this.proxy.abort()
  }

  send(page: number, hpp: number): Promise<QueryData> {
    return this.proxy.makeRequest(this.source, page, hpp)
  }
}
