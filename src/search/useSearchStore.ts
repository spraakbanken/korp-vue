import { computed, ref } from "vue"
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
  const queryExtended = ref<CqpQuery>()
  const querySimple = ref<CqpQuery>()

  const cqpExtended = computed(() => toCqp(queryExtended.value))
  const cqpSimple = computed(() => toCqp(querySimple.value))

  const corpusSelectionDone = until(() => !!corpusSelection.corpora.length).toBe(true)

  async function commitCqp(cqp: string) {
    // Let corpus selection finish settling
    await corpusSelectionDone

    if (!corpusSelection.corpora.length) {
      console.warn("Aborting search: no corpora selected")
      return
    }
    const corpora = corpusSelection.pick(corpusSelection.getIds())
    activeSearch.value = { corpora, cqp }
  }

  async function commitQuery(query: CqpQuery) {
    // Let corpus selection finish settling
    // This also allows any filter selection to be included in the initial search query
    await corpusSelectionDone

    commitCqp(toCqp(query))
  }

  function clearSearch() {
    activeSearch.value = undefined
  }

  /** Serialize query to CQP including any global filters */
  const toCqp = (query?: CqpQuery) =>
    query ? stringify(filterManager.mergeToCqp(query), true) : "[]"

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
