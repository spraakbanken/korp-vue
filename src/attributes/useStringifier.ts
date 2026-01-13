import { Lemgram } from "@/core/lemgram"
import { Saldo } from "@/core/saldo"
import type { Stringifier } from "./attributes.types"
import { useI18n } from "vue-i18n"
import { inject } from "vue"
import { injectionKeys } from "@/injection"

/** Get a stringifier for the given attribute name */
export function useStringifier(name: string) {
  const { t } = useI18n()

  const stringifiers: Readonly<Record<string, Stringifier>> = {
    lex: (item) => (typeof item == "string" && Lemgram.parse(item)?.toHtml(t)) || String(item),
    sense: (item) => (typeof item == "string" && Saldo.parse(item)?.toHtml()) || String(item),
    ...inject(injectionKeys.attribute.stringifiers, {}),
  }

  /** Use a stringifier configured for the given attribute, falling back to `String()` */
  const stringify: Stringifier = (item) => {
    const stringifier = stringifiers[name]
    if (!stringifier) return String(item)
    try {
      return stringifier(item)
    } catch (error) {
      console.error(`Error in "${name}" stringifier with value "${item}":`, error)
      return String(item)
    }
  }

  return {
    stringify,
  }
}
