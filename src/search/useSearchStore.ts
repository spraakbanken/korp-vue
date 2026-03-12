import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import { until } from "@vueuse/core"
import { useReactiveFilterManager } from "./useReactiveFilterManager"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { stringify } from "@/core/cqp/cqp"
import type { CqpQuery } from "@/core/cqp/cqp.types"

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
  const queryExtended = ref<CqpQuery>()
  const querySimple = ref<CqpQuery>()

  const cqpExtended = computed(() => toCqp(queryExtended.value))
  const cqpSimple = computed(() => toCqp(querySimple.value))

  async function commitCqp(cqp: string) {
    // Let filter manager finish settling, so that any filter selection can be included in the initial search query.
    // TODO Weird, Advanced doesn't use filters, find a better way to check for corpus selection
    await until(isFilterReady).toBe(true)

    if (!corpusSelection.corpora.length) {
      console.warn("Aborting search: no corpora selected")
      return
    }
    const corpora = corpusSelection.pick(corpusSelection.getIds())
    activeSearch.value = { corpora, cqp }
  }

  async function commitQuery(query: CqpQuery) {
    // Let filter manager finish settling, so that any filter selection can be included in the initial search query.
    await until(isFilterReady).toBe(true)

    commitCqp(toCqp(query))
  }

  function clearSearch() {
    activeSearch.value = undefined
  }

  /** Serialize query to CQP including any global filters */
  const toCqp = (query?: CqpQuery) =>
    query ? stringify(filterManager.mergeToCqp(query), true) : "[]"

  // Flag when the filter manager has been updated, which is after corpus selection has settled
  watch(filterManager, () => (isFilterReady.value = true))

  return {
    activeSearch,
    clearSearch,
    commitCqp,
    commitQuery,
    cqpExtended,
    cqpSimple,
    queryExtended,
    querySimple,
  }
})
