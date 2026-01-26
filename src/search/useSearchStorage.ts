import currentMode from "@/core/corpora/mode"
import { useLocalStorage } from "@vueuse/core"

export type SavedSearch = {
  label: string
  cqp: string
  corpora: string[]
}

export function useSearchStorage() {
  const searches = useLocalStorage<SavedSearch[]>(`korp.search_storage.${currentMode}`, [])

  function saveSearch(cqp: string, label: string, corpora: string[]) {
    searches.value.push({ cqp, label, corpora })
  }

  function removeSearch(search: SavedSearch) {
    const index = searches.value.indexOf(search)
    if (index >= 0) {
      searches.value.splice(index, 1)
    }
  }

  return {
    searches,
    saveSearch,
    removeSearch,
  }
}
