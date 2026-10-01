import type { ClientPathsWithMethod, Middleware } from "openapi-fetch"
import type { paths } from "./types/openapi-types"
import settings from "../config"
import { KorpBackendError } from "./common"
import createClient from "openapi-fetch"

type RequestOptions = {
  /** Abort signal to cancel the request */
  abortSignal?: AbortSignal
  // /** Callback to visualize progress and paged data (will be called with full response too) */
  // onProgress?: ProgressHandler<TPath>
}

/** Client for the Korp backend OpenAPI spec */
export const client = createClient<paths, "application/json">({
  baseUrl: "https://ws.spraakbanken.gu.se/ws/korp/v9",
})

/** Middleware to convert GET to POST if url is too long */
const convertToPostMiddleware: Middleware = {
  onRequest({ request, params }) {
    if (request.url.length > settings.backendURLMaxLength) {
      return new Request(request.url.replace(/\?.*/, ""), {
        ...request,
        method: "POST",
        headers: { ...request.headers, "Content-Type": "application/json" },
        body: JSON.stringify(params.query),
      })
    }
  },
}

client.use(convertToPostMiddleware)

export async function backendRequest<TPath extends ClientPathsWithMethod<typeof client, "get">>(
  path: TPath,
  params: paths[TPath]["get"]["parameters"]["query"],
  options: RequestOptions = {},
): Promise<paths[TPath]["get"]["responses"][200]["content"]["application/json"]> {
  const { abortSignal } = options

  const init: RequestInit = {
    signal: abortSignal,
  }

  const { data, error } = await client.GET(
    path,
    // @ts-expect-error TODO Get the params right
    { ...init, params: { query: params } },
  )

  if (error) throw new KorpBackendError(error.title, error.detail)

  return data
}
