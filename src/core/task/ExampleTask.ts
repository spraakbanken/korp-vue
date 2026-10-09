import { ConcordanceEndpoint, type ConcordanceData } from "../backend/ConcordanceEndpoint"
import { corpusListing } from "../corpora/corpusListing"
import type { CorpusSet } from "../corpora/CorpusSet"
import { TaskBase } from "./TaskBase"

export class ExampleTask extends TaskBase<ConcordanceData> {
  readonly corpora: CorpusSet
  readonly endpoint = new ConcordanceEndpoint()

  constructor(
    readonly corpusIds: string[],
    readonly cqps: string[],
    readonly defaultWithin?: string,
    readonly isReadingInit = false,
  ) {
    super()
    this.corpora = corpusListing.pick(corpusIds)
  }

  abort() {
    this.endpoint.abort()
  }

  send(
    page: number,
    limit: number,
    reuseCounts: boolean,
    isReading: boolean,
  ): Promise<ConcordanceData> {
    return this.endpoint.query({
      corpora: this.corpusIds,
      cqp: this.cqps,
      display: isReading ? "context" : "kwic",
      page,
      limit,
      reuseCounts,
    })
  }
}
