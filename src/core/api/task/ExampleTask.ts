import { ExampleProxy } from '../proxy/ExampleProxy'
import type { QueryResponse } from '../types/query'
import { TaskBase } from './TaskBase'

export class ExampleTask extends TaskBase<QueryResponse> {
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

  send(page: number, hpp: number, isPaging: boolean, isReading: boolean): Promise<QueryResponse> {
    return this.proxy.makeRequest(page, hpp, isPaging, isReading)
  }
}
