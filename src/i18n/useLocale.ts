import { locObj } from "@/core/i18n"
import type { LangString } from "@/core/model/locale"
import { useI18n } from "vue-i18n"

export function useLocale() {
  const { locale } = useI18n()

  const locObj_ = (map?: LangString) => locObj(map, locale.value)

  return {
    locObj: locObj_,
  }
}
