import { watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"

export let locale: string = ""

/**
 * Expose some state as global variables for use outside Vue.
 *
 * TODO This is an anti-pattern and should probably be replaced.
 */
export function useExpose() {
  const store = useAppStore()

  // Sync state to globals
  watchEffect(() => (locale = store.lang))
}
