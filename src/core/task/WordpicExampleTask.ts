import type { ConcordanceData } from "../backend/ConcordanceEndpoint"
import { DependencyRelationsSentencesEndpoint } from "../backend/DependencyRelationsSentencesEndpoint"
import type { CorpusSet } from "../corpora/CorpusSet"
import { TaskBase } from "./TaskBase"

export class WordpicExampleTask extends TaskBase<ConcordanceData> {
  readonly isReadingInit = false
  readonly endpoint = new DependencyRelationsSentencesEndpoint()

  constructor(
    readonly corpora: CorpusSet,
    readonly sources: string[],
  ) {
    super()
  }

  abort() {
    this.endpoint.abort()
  }

  send(page: number, limit: number) {
    return this.endpoint.query({
      context: this.isReadingInit,
      corpora: this.corpora.getIds(),
      limit,
      page,
      sources: this.sources,
    })
  }
}
