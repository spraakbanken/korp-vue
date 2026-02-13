import { ExampleProxy } from "../backend/proxy/ExampleProxy"
import type { QueryData } from "../backend/proxy/QueryProxyBase"
import { TaskBase } from "./TaskBase"

export class ExampleTask extends TaskBase<QueryData> {
  readonly proxy: ExampleProxy

  constructor(
    readonly corpusIds: string[],
    readonly cqps: string[],
    defaultWithin?: string,
    readonly isReadingInit = false,
  ) {
    super()
    this.proxy = new ExampleProxy(corpusIds, cqps, defaultWithin)
  }

  abort(): void {
    this.proxy.abort()
  }

  send(page: number, hpp: number, isPaging: boolean, isReading: boolean): Promise<QueryData> {
    return this.proxy.makeRequest(page, hpp, isPaging, isReading)
  }
}
