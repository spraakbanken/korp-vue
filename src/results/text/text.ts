import type { Corpus } from "@/core/config/corpusConfig.types"
import type { KwicRow } from "@/core/kwic/kwic"
import type { TextReaderData } from "@/core/task/TextTask"

export type ReaderProps = {
  corpus: Corpus
  document: TextReaderData
  sentence: KwicRow["structs"]
}
