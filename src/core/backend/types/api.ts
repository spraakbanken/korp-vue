import type { CountParams, CountResponse } from "./count"
import type { QueryParams, QueryResponse } from "./query"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
  count: {
    params: CountParams
    response: CountResponse
  }
  query: {
    params: QueryParams
    response: QueryResponse
  }
}
