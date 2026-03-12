import { ref, watch } from "vue"
import { defineStore } from "pinia"
import { until } from "@vueuse/core"
import { useReactiveFilterManager } from "./useReactiveFilterManager"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"

// TODO Replace `{type, cqp}` with just `cqp`? Type used for Related Word.
export type ActiveSearch = {
  type?: "word" | "lemgram"
  cqp: string
}

/** Store for main search query */
export default defineStore("search", () => {
  const filterManager = useReactiveFilterManager()
  const corpusSelection = useReactiveCorpusSelection()

  const activeCorpora = ref<CorpusSet>()
  const activeSearch = ref<ActiveSearch>()
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
    activeSearch,
    clearSearch,
    commitSearch,
  }
})
