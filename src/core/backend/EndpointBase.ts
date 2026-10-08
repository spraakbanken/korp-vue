import Abortable from "./abortable"
import { backendRequest, backendRequestStream } from "./client"
import type { ClientParams, ClientPaths, ClientResponse } from "./client.types"

/** Base class for making requests to a specific Korp API endpoint */
export abstract class EndpointBase<TPath extends ClientPaths, TParams, TData> extends Abortable {
  protected abstract readonly path: TPath
  private lastParams?: ClientParams<TPath>
  private lastResponse?: ClientResponse<TPath>

  /** Get the params used for the last request */
  getParams(): ClientParams<TPath> | undefined {
    return this.lastParams
  }

  /** Get the response from the last request */
  getResponse(): ClientResponse<TPath> | undefined {
    return this.lastResponse
  }

  /** Process the request params into the format expected by the backend */
  abstract processParams(params: TParams): Promise<ClientParams<TPath>>

  /** Process the response data into the format expected by frontend code */
  abstract processResponse(data: ClientResponse<TPath>): Promise<TData>

  /** Make a request to the API endpoint */
  async query(params: TParams): Promise<TData> {
    const requestParams = await this.processParams(params)
    const options = { abortSignal: this.getAbortSignal() }
    const data = await backendRequest(this.path, requestParams, options)
    return this.processResponse(data)
  }

  /** Make a request to the API endpoint, streaming progress and partial data */
  async stream(
    params: TParams,
    onProgress?: (progress: number) => void,
    onData?: (data: ClientResponse<TPath>) => void,
  ): Promise<TData> {
    const requestParams = await this.processParams(params)
    const options = { abortSignal: this.getAbortSignal() }
    const data = await backendRequestStream(this.path, requestParams, onProgress, onData, options)
    return this.processResponse(data)
  }
}
