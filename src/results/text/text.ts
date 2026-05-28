import type { Corpus } from "@/core/config/corpusConfig.types"
import type { KwicRow } from "@/core/kwic/kwic"
import type { Component } from "vue"

/** A fulltext reader definition */
export type Reader = {
  component: Component<ReaderProps>
}

export type ReaderProps = {
  corpus: Corpus
  document: KwicRow
  textId: string
}
