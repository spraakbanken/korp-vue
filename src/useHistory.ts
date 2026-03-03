import { cloneDeep, debounce, isEqual, once } from "lodash-es"
import type { Store } from "pinia"

/** Record state changes in browser history */
const useHistory = once((store: Store) => {
  // Record initial state
  window.history.replaceState(cloneDeep(store.$state), "")

  // Record state changes in history
  // Debounce to merge quick sequences of state changes
  store.$subscribe(
    debounce((mutation, state) => {
      const raw = cloneDeep(state)
      const isNewState = !isEqual(window.history.state, raw)
      if (isNewState) window.history.pushState(raw, "")
    }, 100),
  )

  // Restore state when navigating history
  window.addEventListener("popstate", (event) => store.$patch(event.state))
})

export default useHistory
