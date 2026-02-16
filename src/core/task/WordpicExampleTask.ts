import type { QueryData } from "../backend/proxy/QueryProxyBase"
import { RelationsSentencesProxy } from "../backend/proxy/RelationsSentencesProxy"
import { TaskBase } from "./TaskBase"

export class WordpicExampleTask extends TaskBase<QueryData> {
  readonly isReadingInit = false // Context param is not supported by /relations_sentences
  readonly proxy = new RelationsSentencesProxy()

  constructor(readonly source: string) {
    super()
  }

  abort(): void {
    this.proxy.abort()
  }

  send(page: number, hpp: number): Promise<QueryData> {
    return this.proxy.makeRequest(this.source, page, hpp)
  }
}
