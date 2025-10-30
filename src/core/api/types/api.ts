import type { AttrValuesParams, AttrValuesResponseDeep, AttrValuesResponseFlat } from "./attrValues"
import type { CorpusConfigParams, CorpusConfigResponse } from "./corpusConfig"
import type { CorpusInfoParams, CorpusInfoResponse } from "./corpusInfo"
import type { CountParams, CountResponse } from "./count"
import type { CountTimeParams, CountTimeResponse } from "./countTime"
import type { LemgramCountParams, LemgramCountResponse } from "./lemgramCount"
import type { LoglikeParams, LoglikeResponse } from "./loglike"
import type { QueryParams, QueryResponse } from "./query"
import type { RelationsParams, RelationsResponse } from "./relations"
import type { RelationsSentencesParams, RelationsSentencesResponse } from "./relations-sentences"
import type { TimespanParams, TimespanResponse } from "./timespan"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
  attr_values: {
    params: AttrValuesParams
    // Depth of data structure depends on amount of attributes in the `attr` param
    response: AttrValuesResponseFlat | AttrValuesResponseDeep
  }
  corpus_config: {
    params: CorpusConfigParams
    response: CorpusConfigResponse
  }
  corpus_info: {
    params: CorpusInfoParams
    response: CorpusInfoResponse
  }
  count: {
    params: CountParams
    response: CountResponse
  }
  count_time: {
    params: CountTimeParams
    response: CountTimeResponse
  }
  lemgram_count: {
    params: LemgramCountParams
    response: LemgramCountResponse
  }
  loglike: {
    params: LoglikeParams
    response: LoglikeResponse
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
  timespan: {
    params: TimespanParams
    response: TimespanResponse
  }
}
