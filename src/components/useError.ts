import { ref } from "vue"
import type { ErrorMessage } from "./ErrorBox.vue"
import { KorpBackendError } from "@/core/backend/common"
import { useI18n } from "vue-i18n"
import { RelationsParseError } from "@/core/backend/proxy/RelationsProxy"

/** Interprets and holds an error, suitable for use with the `ErrorBox` component. */
export default function useError() {
  const { t } = useI18n()
  const errorMessage = ref<ErrorMessage>()

  /** Interpret and store an error */
  function setError(error: unknown) {
    errorMessage.value = interpretError(error)
    console.error(error)
  }

  /** Interpret an error into a format suitable for `ErrorBox` */
  function interpretError(error: unknown): ErrorMessage {
    if (error instanceof KorpBackendError)
      return {
        message: t("error.backend", { type: error.type }),
        code: error.value,
      }

    if (error instanceof RelationsParseError) {
      return {
        message: t("result.wordpic.query.incompatible"),
        details: t("result.wordpic.query.incompatible.help"),
        code: error.message,
      }
    }

    return { message: error instanceof Error ? error.message : String(error) }
  }

  /** Clear any error */
  function clearError() {
    errorMessage.value = undefined
  }

  return { setError, clearError, errorMessage }
}
