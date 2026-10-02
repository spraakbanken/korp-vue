import type { AttrValuesParams, AttrValuesResponseDeep, AttrValuesResponseFlat } from "./attrValues"
import type { CountParams, CountResponse } from "./count"
import type { CountTimeParams, CountTimeResponse } from "./countTime"
import type { QueryParams, QueryResponse } from "./query"
import type { RelationsParams, RelationsResponse } from "./relations"
import type { RelationsSentencesParams, RelationsSentencesResponse } from "./relations-sentences"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
  attr_values: {
    params: AttrValuesParams
    // Depth of data structure depends on amount of attributes in the `attr` param
    response: AttrValuesResponseFlat | AttrValuesResponseDeep
  }
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
  relations: {
    params: RelationsParams
    response: RelationsResponse
  }
  relations_sentences: {
    params: RelationsSentencesParams
    response: RelationsSentencesResponse
  }
}
