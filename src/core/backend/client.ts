import createClient, { type Middleware } from "openapi-fetch"
import { omit, pick } from "lodash-es"
import settings from "../config"
import { KorpBackendError, readIncrementally } from "./common"
import type { paths } from "./types/openapi-types"
import type {
  ClientParams,
  ClientPaths,
  ClientResponse,
  DataHandler,
  ProgressHandler,
  RequestOptions,
  StreamEvent,
} from "./types/client.types"
import { corpusListing } from "../corpora/corpusListing"

/** Client for the Korp backend OpenAPI spec */
export const client = createClient<paths, "application/json">({
  baseUrl: "https://ws.spraakbanken.gu.se/ws/korp/v9",
})

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

client.use(convertToPostMiddleware)

export async function backendRequest<TPath extends ClientPaths>(
  path: TPath,
  params: ClientParams<TPath> = {},
  options: RequestOptions = {},
): Promise<ClientResponse<TPath>> {
  const { abortSignal } = options

  const init = {
    params: { query: params },
    signal: abortSignal,
  }

  const { data, error } = await client.GET(
    path,
    // @ts-expect-error TODO Get the params right
    init,
  )

  if (error) throw new KorpBackendError(error.title, error.detail)

  return data
}

export async function backendRequestStream<TPath extends ClientPaths>(
  path: TPath,
  params: ClientParams<TPath> = {},
  onProgress?: ProgressHandler,
  onData?: DataHandler<TPath>,
  options: RequestOptions = {},
): Promise<ClientResponse<TPath>> {
  const { abortSignal } = options

  const init = {
    params: { query: { ...params, stream: true } },
    signal: abortSignal,
    parseAs: "stream",
  }

  const { data, error } = await client.GET(
    path,
    // @ts-expect-error TODO Get the params right
    init,
  )

  if (error) throw new KorpBackendError(error.title, error.detail)

  const body = data as Response["body"]
  if (!body) throw new ClientStreamBodyMissingError(path)

  let totalSize = 0
  let hits = 0
  let percent = 0
  const finalData = {}

  await readIncrementally(
    body,
    parseNdjson((event) => {
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
    }),
  )

  return finalData
}

/** Parse a chunk of NDJSON data and handle each event */
function parseNdjson(handleEvent: (event: StreamEvent) => void) {
  let line = ""
  return (chunk: string) => {
    chunk.split("\n").forEach((json) => {
      // End of stream?
      if (!json) {
        if (line) console.error("Incomplete JSON line at end of stream")
        return
      }
      // Add chunk to line buffer
      line += json
      try {
        const event = JSON.parse(line)
        line = ""
        handleEvent(event)
      } catch {
        // JSON was not complete, wait for next chunk to complete the line
      }
    })
  }
}

class ClientStreamBodyMissingError extends Error {
  constructor(path: string) {
    super(`No body in streamed response from "${path}"`)
    this.name = "ClientStreamBodyMissingError"
  }
}
