import useError from "@/components/useError"
import { onUnmounted, ref } from "vue"

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
  function listenAbort(onAbort: () => void) {
    function onEscapeKey(event: KeyboardEvent) {
      if (event.key != "Escape" || !isWorking()) return
      setState("aborted")
      onAbort()
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
