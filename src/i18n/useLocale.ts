import { locObj } from "@/core/i18n"
import type { LangString } from "@/core/model/locale"
import { useI18n } from "vue-i18n"

export function useLocale() {
  const { locale } = useI18n()

  /**
   * Get translated string from a given object.
   * Like `locObj()` in `@/core/i18n` but reactive to current language.
   */
  const locObj_ = (map?: LangString) => locObj(map, locale.value)

  return {
    locObj: locObj_,
  }
}
