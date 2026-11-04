import { locObj } from "@/core/i18n"
import type { LangString } from "@/core/model/locale"
import { injectionKeys } from "@/injection"
import { inject } from "vue"
import { useI18n } from "vue-i18n"

export function useLocale() {
  const { locale } = useI18n()
  const largeNumberFormatter = inject(injectionKeys.largeNumberFormatter, undefined)

  function formatLargeNumber(n: number) {
    // Allow instance to override formatting
    if (largeNumberFormatter) return largeNumberFormatter(locale.value, n)
    // Fall back to native locale-aware formatting
    const numberFormat = new Intl.NumberFormat(locale.value, { notation: "compact" })
    return numberFormat.format(n)
  }

  /**
   * Get translated string from a given object.
   * Like `locObj()` in `@/core/i18n` but reactive to current language.
   */
  const locObj_ = (map?: LangString) => locObj(map, locale.value)

  const locDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(locale.value, { dateStyle: "long" })

  return {
    formatLargeNumber,
    locDate,
    locObj: locObj_,
  }
}
