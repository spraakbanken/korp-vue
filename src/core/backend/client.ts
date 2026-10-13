import createClient, { type Client, type Middleware } from "openapi-fetch"
import { omit, pick } from "lodash-es"
import settings from "../config"
import type { paths } from "./korp-api"
import type {
  ClientParams,
  ClientPaths,
  ClientResponse,
  DataHandler,
  ProgressHandler,
  RequestOptions,
  StreamEvent,
} from "./client.types"
import { corpusListing } from "../corpora/corpusListing"
import { auth } from "../auth"

/** Client for the Korp backend */
export let client: Client<paths, "application/json">

/** Initialize client for the Korp backend OpenAPI spec */
export function createKorpClient(baseUrl: string) {
  client = createClient({ baseUrl })
  client.use(convertToPostMiddleware)
}

/** Middleware to convert GET to POST if url is too long */
const convertToPostMiddleware: Middleware = {
  onRequest({ request, params }) {
    if (request.url.length > settings.backendURLMaxLength) {
      // Some params should be in the query string even for POST requests
      const metaParams = ["cache", "debug", "indent", "stream"]
      const queryParams = pick(params.query, ...metaParams)
      const bodyParams = omit(params.query, ...metaParams)

      // Create URL with query params
      const url = new URL(request.url)
      url.search = new URLSearchParams(queryParams as Record<string, string>).toString()

      return new Request(url.toString(), {
        ...request,
        method: "POST",
        headers: { ...request.headers, "Content-Type": "application/json" },
        body: JSON.stringify(bodyParams),
      })
    }
  },
}

export async function backendQuery<TPath extends ClientPaths>(
  path: TPath,
  params: ClientParams<TPath> = {},
  options: RequestOptions = {},
): Promise<ClientResponse<TPath>> {
  const { abortSignal } = options

  const init = {
    headers: auth?.getAuthorizationHeader() || {},
    params: { query: params },
    signal: abortSignal,
  }

  const { data, error } = await client.GET(
    path,
    // @ts-expect-error TODO Get the params type right
    init,
  )

  if (error) throw new KorpBackendError(error.title, error.detail)

  return data
}

export async function backendStream<TPath extends ClientPaths>(
  path: TPath,
  params: ClientParams<TPath> = {},
  onProgress?: ProgressHandler,
  onData?: DataHandler<TPath>,
  options: RequestOptions = {},
): Promise<ClientResponse<TPath>> {
  const { abortSignal } = options

  const init = {
    headers: auth?.getAuthorizationHeader() || {},
    params: { query: { ...params, stream: true } },
    signal: abortSignal,
    parseAs: "stream",
  }

  const { data, error } = await client.GET(
    path,
    // @ts-expect-error TODO Get the params type right
    init,
  )

  if (error) throw new KorpBackendError(error.title, error.detail)

  const body = data as Response["body"]
  if (!body) throw new ClientStreamBodyMissingError(path)

  let totalSize = 0
  let hits = 0
  let percent = 0
  const finalData = {}

  await readNdjsonStream<StreamEvent>(body, (event) => {
    if (event.event == "result") {
      // Add new data to final object and call data handler
      Object.assign(finalData, event.data)
      onData?.(event.data as Partial<ClientResponse<TPath>>)
    }

    if (event.event == "progress" && onProgress) {
      // Calculate progress
      // `corpora` is the list of corpora to be processed: get and store total token count
      if (event.corpora) totalSize = corpusListing.pick(event.corpora).getTokenCount()
      // `corpus` is a corpus that has been processed: add its size as percentage of the total
      if (totalSize && event.corpus) {
        const size = corpusListing.get(event.corpus)?.info.size || 0
        percent += (size / totalSize) * 100
      }
      if (event.hits) hits += event.hits
      onProgress(percent, hits)
    }

    if (event.event == "error") throw new KorpBackendError(event.error.title, event.error.detail)
  })

  return finalData
}

/** Read and handle a NDJSON stream */
export async function readNdjsonStream<TEvent>(
  stream: ReadableStream,
  handleEvent: (event: TEvent) => void,
): Promise<void> {
  const reader = stream.getReader()
  // Store incomplete JSON line possibly remaining from last chunk */
  let incomplete = ""
  // Read the stream
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = new TextDecoder("utf-8").decode(value)
    // Add incomplete part of previous chunk
    const chunkFull = incomplete + chunk
    incomplete = ""
    // Parse each line as an event
    chunkFull.split("\n").forEach((line) => {
      // End of chunk
      if (!line) return
      // Parse and handle event
      try {
        const event = JSON.parse(line)
        handleEvent(event)
      } catch (error) {
        if (error instanceof SyntaxError)
          // JSON was not complete, wait for next chunk to complete the line
          incomplete = line
        else throw error
      }
    })
  }
}

export class KorpBackendError extends Error {
  constructor(
    public readonly type: string,
    public readonly value: string,
  ) {
    super(`${type}: ${value}`)
    this.name = "KorpBackendError"
  }
}

class ClientStreamBodyMissingError extends Error {
  constructor(path: string) {
    super(`No body in streamed response from "${path}"`)
    this.name = "ClientStreamBodyMissingError"
  }
}
