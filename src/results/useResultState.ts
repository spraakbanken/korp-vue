import useError from "@/components/useError"
import { ref } from "vue"

export type ResultState = "initial" | "loading" | "updating" | "done" | "aborted" | "error"

// TODO Use in all result tabs
export function useResultState() {
  const { errorMessage, clearError, setError: setErrorReal } = useError()

  const state = ref<ResultState>("initial")

  function setError(message: unknown) {
    setErrorReal(message)
    state.value = "error"
  }

  function setState(newState: Exclude<ResultState, "error">) {
    state.value = newState
    clearError()
  }

  return {
    errorMessage,
    state,
    setError,
    setState,
  }
}
