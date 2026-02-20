import { Lemgram } from "@/core/lemgram"
import { Saldo } from "@/core/saldo"
import type { Stringifier } from "./attributes.types"
import { useI18n } from "vue-i18n"
import { inject } from "vue"
import { injectionKeys } from "@/injection"
import { escape } from "lodash-es"
import { useLocale } from "@/i18n/useLocale"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"

/**
 * Get a stringifier for the given attribute config.
 *
 * Custom stringifiers can be added using `provide`. For the sidebar, advanced output can be implemented as a formatter component instead.
 */
export function useStringifiers() {
  const { t } = useI18n()
  const { locObj } = useLocale()

  /** Custom stringifiers possibly provided by instance plugin */
  const customStringifiers = inject(injectionKeys.attribute.stringifiers, {})

  /** Get default or custom stringifier for the given attribute */
  const getStringifier: (attribute: Attribute) => Stringifier = (attribute) => (str) => {
    try {
      // Use custom stringifier if configured for this attribute
      if (customStringifiers[attribute.name]) return customStringifiers[attribute.name]!(str)
      // Otherwise use default stringifier
      return getDefaultStringifier(attribute)(str)
    } catch (error) {
      console.error(`Error in "${attribute.name}" stringifier with value "${str}":`, error)
    }
    // Return the input string as a fallback
    return str
  }

  /** Handles a few standard attribute types */
  const getDefaultStringifier: (attribute: Attribute) => Stringifier = (attribute) => (str) => {
    // Escape characters in raw value that could break HTML, like "<" and "&"
    str = escape(str)

    // For ranked attributes, remove the ":<score>" suffix
    if (attribute.ranked) str = str.replace(/:.*/, "")

    // If the attribute has a translation table, look up the value there
    if (attribute.translation) str = locObj(attribute.translation[str])

    // Parse some standard attribute types
    if (["prefix", "suffix", "lex"].includes(attribute.name))
      str = Lemgram.parse(str)?.toHtml(t) || str
    else if (["saldo", "sense"].includes(attribute.name)) str = Saldo.parse(str)?.toHtml() || str
    else if (attribute.name == "lemma") str = str.replace(/_/g, " ")

    return str
  }

  return getStringifier
}
