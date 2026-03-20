import { ExampleProxy } from "../backend/proxy/ExampleProxy"
import type { QueryData } from "../backend/proxy/QueryProxyBase"
import { corpusListing } from "../corpora/corpusListing"
import type { CorpusSet } from "../corpora/CorpusSet"
import { TaskBase } from "./TaskBase"

export class ExampleTask extends TaskBase<QueryData> {
  readonly corpora: CorpusSet
  readonly proxy: ExampleProxy

  constructor(
    readonly corpusIds: string[],
    readonly cqps: string[],
    defaultWithin?: string,
    readonly isReadingInit = false,
  ) {
    super()
    this.corpora = corpusListing.pick(corpusIds)
    this.proxy = new ExampleProxy(corpusIds, cqps, defaultWithin)
  }

  abort(): void {
    this.proxy.abort()
  }

  send(page: number, hpp: number, reuseCounts: boolean, isReading: boolean): Promise<QueryData> {
    return this.proxy.makeRequest(page, hpp, reuseCounts, isReading)
  }
}
