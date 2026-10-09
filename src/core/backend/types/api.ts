import type { CountParams, CountResponse } from "./count"
import type { CountTimeParams, CountTimeResponse } from "./countTime"
import type { QueryParams, QueryResponse } from "./query"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
  count: {
    params: CountParams
    response: CountResponse
  }
  count_time: {
    params: CountTimeParams
    response: CountTimeResponse
  }
  query: {
    params: QueryParams
    response: QueryResponse
  }
}
