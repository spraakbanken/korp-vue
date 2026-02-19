import type { Labeled, LangString, LocLangMap, LocMap } from "@/core/model/locale"
import type { MaybeWithOptions } from "./config.types"
import type { OperatorKorp } from "../cqp/cqp.types"

/** Typings for config as fetched from backend. */
export type CorpusConfigRaw = {
  attributes: {
    pos_attributes: Record<string, Attribute>
    struct_attributes: Record<string, Attribute>
    custom_attributes?: Record<string, CustomAttribute>
  }
  corpora: Record<string, CorpusRaw>
  /** Writing direction of corpus text. */
  dir?: "rtl"
  folders?: Record<string, Folder>
  label: LangString
  map_enabled?: boolean
  mode_description?: LangString
  modes: {
    mode: string
    label: LangString
    labOnly?: boolean
  }[]
  order?: number
  parallel?: boolean
  preselected_corpora?: string[]
  start_lang?: string
}

export type CorpusRaw = {
  /** Attributes to use in global filters */
  attribute_filters: string[]
  context: Labeled[]
  deptree?: DeptreeConfig
  description: LangString
  hide?: boolean
  id: string
  /** Must be present in parallel corpus */
  lang?: string
  limited_access?: boolean
  linked_to?: string[]
  pivot?: boolean
  pos_attributes: string[]
  struct_attributes: string[]
  custom_attributes?: string[]
  reading_mode?: boolean | ReadingModeConfig
  title: LangString
  within: Labeled[]
}

export type CorpusParallel = CorpusRaw & Required<Pick<CorpusRaw, "lang" | "linked_to">>

export type ReadingModeConfig = {
  component: string
  group_element?: string
}

export type Folder = {
  description?: LangString
  title: LangString
  subfolders?: Record<string, Folder>
  corpora?: string[]
}

export type Attribute = {
  dataset?: Record<string, string> | string[]
  /** Handled by CorpusListing */
  disabled?: true
  display_type?: "hidden"
  escape?: boolean
  extended_component?: MaybeWithOptions
  extended_template?: string
  external_search?: string
  group_by?: "group_by" | "group_by_struct"
  hide_compare?: boolean
  hide_extended?: boolean
  hide_sidebar?: boolean
  hide_statistics?: boolean
  internal_search?: boolean
  is?: string
  is_struct_attr?: boolean
  label: LangString
  name: string
  /** Available operators, default is to copy the `default_options` setting */
  opts?: Record<string, OperatorKorp> | false
  order?: number
  pattern?: string
  ranked?: boolean
  sidebar_component?: MaybeWithOptions
  sidebar_info_url?: string
  sidebar_hide_label?: boolean
  stats_cqp?: string
  stats_stringify?: string
  stringify?: string
  translation?: LocLangMap | LocMap
  type?: "set" | "url"
}

export type CustomAttribute = Attribute & {
  custom_type: string
}

export type DeptreeConfig = {
  attrs?: {
    /** Attribute name for the token position (default: "ref") */
    ref?: string
    /** Attribute name for the part of speech (default: "pos") */
    pos?: string
    /** Attribute name for the head token position (default: "dephead") */
    head?: string
    /** Attribute name for the syntactic relation (default: "deprel") */
    rel?: string
  }
  /** Disable deptree visualization */
  hidden?: boolean
}
