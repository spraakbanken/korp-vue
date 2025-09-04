import type { LangString } from '../model/locale'
import type {
  Attribute,
  CorpusConfigRaw,
  CorpusRaw,
  CustomAttribute,
  Folder,
} from './corpusConfigRaw.types'
import type { CorpusInfoInfo } from '@/core/api/types/corpusInfo'

/** Config as transformed after being fetched from backend */
export type CorpusConfig = Omit<CorpusConfigRaw, 'attributes' | 'corpora' | 'label'> & {
  corpora: Record<string, Corpus>
  folders: Record<string, Folder>
  mode: {
    label: LangString
  }
}

/** Corpus config as transformed after being fetched from backend */
export type Corpus<T extends CorpusRaw = CorpusRaw> = Omit<
  T,
  'pos_attributes' | 'struct_attributes' | 'custom_attributes' | 'within' | 'context'
> & {
  attributes: Record<string, Attribute>
  struct_attributes: Record<string, Attribute>
  custom_attributes?: Record<string, CustomAttribute>
  _attributes_order: string[]
  _struct_attributes_order: string[]
  _custom_attributes_order: string[]
  private_struct_attributes: string[]
  within: Record<string, string>
  context: Record<string, string>
  info: CorpusInfoInfo
  common_attributes?: Record<string, true>
  time?: Record<number, number>
  non_time?: number
  morphology?: string
  selected?: boolean
  tokens?: number
  sentences?: number
  userHasAccess?: boolean
}
