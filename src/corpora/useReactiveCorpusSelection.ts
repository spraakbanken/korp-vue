import { corpusSelection } from "@/core/corpora/corpusListing"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { once } from "lodash"
import { reactive, type Reactive } from "vue"

/** Reactive wrapper around the global `corpusSelection` object */
// Use `once` to ensure the reactive wrapper is only created once and then reused.
export const useReactiveCorpusSelection = once(
  () => reactive(corpusSelection) as Reactive<CorpusSet> & CorpusSet,
)
