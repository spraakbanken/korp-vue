import type { ActiveSearch } from "@/core/model/store"
import { readonly, ref, watch } from "vue"
import { useReactiveFilterManager } from "./useReactiveFilterManager"
import { until } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { useAppStore } from "@/store/useAppStore"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"

const activeCorpora = ref<CorpusSet>()

/** Service for managing main search query */
export default function useSearch() {
  const filterManager = useReactiveFilterManager()
  const corpusSelection = useReactiveCorpusSelection()
  const store = useAppStore()
  // TODO Move activeSearch here?
  // TODO Replace `{type, cqp}` with just `cqp`? Type used for Related Word.
  const { activeSearch } = storeToRefs(store)

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

  // Flag when the filter manager has been updated, which is after corpus selection has settled
  watch(filterManager, () => (isFilterReady.value = true))

  return {
    activeCorpora,
    activeSearch: readonly(activeSearch),
    commitSearch,
  }
}
