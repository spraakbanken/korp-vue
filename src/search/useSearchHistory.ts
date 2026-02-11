import currentMode from "@/core/corpora/mode"
import type { Store } from "@/core/model/store"
import { getSearchParamNames, type SearchParamNames } from "@/core/url"
import { splitFirst, unregescape } from "@/core/util"
import { useAppStore } from "@/store/useAppStore"
import { useLocalStorage, whenever } from "@vueuse/core"
import { isEqual, pick } from "lodash"
import { storeToRefs } from "pinia"
import { computed, readonly } from "vue"

type SearchState = Pick<Store, SearchParamNames>

type HistoryOption = {
  id: string
  label: string
  state: SearchState
}

export default function useSearchHistory() {
  const storage = useLocalStorage<SearchState[]>(`korp.history.${currentMode}`, [])
  const store = useAppStore()
  const { activeSearch } = storeToRefs(store)

  // Save every new search to history
  // TODO Will include params for non-active search modes (e.g. `prefix` from Simple when the active search is from Extended)
  // TODO and thus sometimes falsely save given state as new entry.
  whenever(activeSearch, () => {
    // Get search-related parts of app state
    const stateRaw = pick(store, getSearchParamNames())
    // Deep-clone to strip reactivity and replicate serialization done by `useLocalStorage` (remove undefined properties)
    const state = JSON.parse(JSON.stringify(stateRaw)) as SearchState

    // Add to top of history list, unless already in list
    const isNew = storage.value.every((item) => !isEqual(item, state))
    if (isNew) storage.value.unshift(state)

    // Limit history to 20 items
    if (storage.value.length > 20) storage.value.pop()
  })

  /** Restore selected search state to the store */
  function restoreFromHistory(state: SearchState) {
    store.$patch(state)
  }

  /** History items reshaped for UI */
  const historyOptions = computed<HistoryOption[]>(() =>
    storage.value.map((state) => ({
      id: JSON.stringify(state),
      label: createLabel(state),
      state,
    })),
  )

  /** Create a label for a history item */
  function createLabel(state: SearchState): string {
    if (!state.search) return "–"
    if (state.search == "cqp") return state.cqp || "–"
    const [type, value] = splitFirst("|", state.search)
    return type === "lemgram" ? unregescape(value) : value
  }

  /** Clear search history */
  function clearHistory() {
    storage.value = []
  }

  /** Whether a given history item matches the current search. */
  function isCurrentSearch(state: SearchState): boolean {
    const currentState = pick(store, getSearchParamNames())
    return isEqual(state, currentState)
  }

  return {
    clearHistory,
    historyItems: readonly(storage),
    historyOptions,
    isCurrentSearch,
    restoreFromHistory,
  }
}
