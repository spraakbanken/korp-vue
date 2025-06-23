/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_config/get */

export type CorpusConfigParams = {
  mode: string
  corpus?: string
  include_lab?: string
}

export type CorpusConfigResponse = CorpusConfig

export type CorpusConfig = {
  corpora: Record<string, Corpus>
  modes: Mode[]
  preselected_corpora?: string[]
}

export type Mode = {
  mode: string
  label: string | Record<string, string>
  labOnly?: boolean
}

export type Corpus = {
  hide?: boolean
  id: string
  pos_attributes: string[]
  struct_attributes: string[]
  custom_attributes?: string[]
  title: string | Record<string, string>
}
