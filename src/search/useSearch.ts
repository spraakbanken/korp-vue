import { readonly, ref, watch } from "vue"
import { useReactiveFilterManager } from "./useReactiveFilterManager"
import { until } from "@vueuse/core"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"

// TODO Replace `{type, cqp}` with just `cqp`? Type used for Related Word.
export type ActiveSearch = {
  type?: "word" | "lemgram"
  cqp: string
}

const activeCorpora = ref<CorpusSet>()
const activeSearch = ref<ActiveSearch>()

/** Service for managing main search query */
export default function useSearch() {
  const filterManager = useReactiveFilterManager()
  const corpusSelection = useReactiveCorpusSelection()

  const isFilterReady = ref(false)

  async function commitSearch(search: ActiveSearch) {
    // Let filter manager finish settling, so that any filter selection can be included in the initial search query.
    await until(isFilterReady).toBe(true)

    if (!corpusSelection.corpora.length) {
      console.warn("Aborting search: no corpora selected")
      return
    }

    activeSearch.value = search
    activeCorpora.value = corpusSelection.pick(corpusSelection.getIds())
  }

  function clearSearch() {
    activeSearch.value = undefined
  }

  // Flag when the filter manager has been updated, which is after corpus selection has settled
  watch(filterManager, () => (isFilterReady.value = true))

  return {
    activeCorpora,
    activeSearch: readonly(activeSearch),
    clearSearch,
    commitSearch,
  }
}
