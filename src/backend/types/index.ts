/** @format */

import type { CorpusConfigParams, CorpusConfigResponse } from './corpus-config.ts'
import type { CorpusInfoParams, CorpusInfoResponse } from './corpus-info.ts'

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
  corpus_config: {
    params: CorpusConfigParams
    response: CorpusConfigResponse
  }
  corpus_info: {
    params: CorpusInfoParams
    response: CorpusInfoResponse
  }
}
