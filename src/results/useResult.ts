import useError from "@/components/useError"
import type Abortable from "@/core/backend/abortable"
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import { useEventListener } from "@vueuse/core"
import { ref, shallowRef, type Ref } from "vue"

export type ResultState = "initial" | "loading" | "updating" | "done" | "aborted" | "error"

/** Manages loading a result with progress percentage, abortion and error handling. */
export function useResult<T>(
  progress: Ref<number | undefined>,
  load: (updating: boolean) => Promise<T>,
  abortable?: Abortable,
  /** Optional callback to handle errors, should return same or different error. */
  onError?: (error: unknown) => unknown | undefined,
) {
  const { errorMessage, clearError, setError } = useError()

  /** Result data */
  const data = shallowRef<T>()
  /** State of the result loading process */
  const state = ref<ResultState>("initial")

  /** Call loader and manage state */
  async function loadResult(updating = false): Promise<void> {
    // First reset state
    clearError()
    abortable?.abort()
    if (!updating) data.value = undefined
    state.value = updating ? "updating" : "loading"
    progress.value = 0

    try {
      // Happy path: load data and be done
      data.value = await load(updating)
      state.value = "done"
      progress.value = 100
    } catch (error) {
      progress.value = undefined
      // Do not set the "aborted" state here, because this can happen also if just
      // issuing a new search while the previous is still loading.
      if (isAbortError(error)) return

      state.value = "error"
      if (onError) error = onError(error)
      setError(error)
      data.value = undefined
      return
    }
  }

  /** Handle Escape key to abort current operation */
  useEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key == "Escape") abort()
  })

  function abort() {
    if (!abortable) return
    if (!["loading", "updating"].includes(state.value)) return
    state.value = "aborted"
    abortable.abort()
    progress.value = undefined
  }

  return {
    abort,
    data,
    errorMessage,
    loadResult,
    state,
  }
}
