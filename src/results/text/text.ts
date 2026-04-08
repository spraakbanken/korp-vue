import type { Corpus } from "@/core/config/corpusConfig.types"
import type { KwicRow } from "@/core/kwic/kwic"

export type ReaderProps = {
  corpus: Corpus
  document: KwicRow
  textId: string
}
