import { ref, watch } from "vue"
import { defineStore } from "pinia"
import { until } from "@vueuse/core"
import { useReactiveFilterManager } from "./useReactiveFilterManager"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"

export type ActiveSearch = {
  corpora: CorpusSet
  cqp: string
}

/** Store for main search query */
export default defineStore("search", () => {
  const filterManager = useReactiveFilterManager()
  const corpusSelection = useReactiveCorpusSelection()

  const activeSearch = ref<ActiveSearch>()
  const isFilterReady = ref(false)

  async function commitSearch(cqp: string) {
    // Let filter manager finish settling, so that any filter selection can be included in the initial search query.
    await until(isFilterReady).toBe(true)

    if (!corpusSelection.corpora.length) {
      console.warn("Aborting search: no corpora selected")
      return
    }

    const corpora = corpusSelection.pick(corpusSelection.getIds())

    activeSearch.value = { corpora, cqp }
  }

  function clearSearch() {
    activeSearch.value = undefined
  }

  // Flag when the filter manager has been updated, which is after corpus selection has settled
  watch(filterManager, () => (isFilterReady.value = true))

  return {
    activeSearch,
    clearSearch,
    commitSearch,
  }
})
