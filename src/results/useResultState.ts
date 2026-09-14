import useError from "@/components/useError"
import type Abortable from "@/core/backend/abortable"
import { onUnmounted, ref, type Ref } from "vue"

export type ResultState = "initial" | "loading" | "updating" | "done" | "aborted" | "error"

export function useResultState() {
  const { errorMessage, clearError, setError: setErrorReal } = useError()

  const state = ref<ResultState>("initial")

  const isWorking = () => ["loading", "updating"].includes(state.value)

  function setError(message: unknown) {
    setErrorReal(message)
    state.value = "error"
  }

  function setState(newState: Exclude<ResultState, "error">) {
    state.value = newState
    clearError()
  }

  /** Listen for the Escape key to abort the current operation */
  function listenAbort(abortable: Abortable, progress: Ref<number | undefined>): void {
    function onEscapeKey(event: KeyboardEvent) {
      if (event.key != "Escape" || !isWorking()) return
      setState("aborted")
      abortable.abort()
      progress.value = undefined
    }
    // Attach listener now, detach when calling component is unmounted
    window.addEventListener("keyup", onEscapeKey)
    onUnmounted(() => window.removeEventListener("keyup", onEscapeKey))
  }

  return {
    errorMessage,
    state,
    setError,
    setState,
    listenAbort,
  }
}
