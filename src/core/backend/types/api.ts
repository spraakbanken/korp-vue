import type { CountParams, CountResponse } from "./count"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
  count: {
    params: CountParams
    response: CountResponse
  }
}
