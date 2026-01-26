import { RelationsSentencesProxy } from "../backend/proxy/RelationsSentencesProxy"
import type { RelationsSentencesResponse } from "../backend/types/relations-sentences"
import { TaskBase } from "./TaskBase"

export class WordpicExampleTask extends TaskBase<RelationsSentencesResponse> {
  readonly proxy = new RelationsSentencesProxy()

  constructor(readonly source: string) {
    super()
  }

  abort(): void {
    this.proxy.abort()
  }

  send(page: number, hpp: number): Promise<RelationsSentencesResponse> {
    return this.proxy.makeRequest(this.source, page, hpp)
  }
}
