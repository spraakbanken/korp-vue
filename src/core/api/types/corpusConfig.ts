import type { Config } from '@/core/config/config.types'

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_config/get */
export type CorpusConfigParams = {
  mode: string
  corpus?: string
  include_lab?: string
}

export type CorpusConfigResponse = Config
