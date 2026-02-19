import { Lemgram } from "@/core/lemgram"
import { Saldo } from "@/core/saldo"
import type { Stringifier } from "./attributes.types"
import { useI18n } from "vue-i18n"
import { inject } from "vue"
import { injectionKeys } from "@/injection"
import { escape, template } from "lodash-es"
import { useLocale } from "@/i18n/useLocale"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"

/**
 * Get a stringifier for the given attribute config.
 *
 * Custom stringifiers can be added using `provide`. For advanced output, implement a formatter component instead.
 */
export function useStringifier(
  attribute: Attribute,
  context?: { pos: Record<string, unknown>; struct: Record<string, unknown> },
) {
  const { t } = useI18n()
  const { locObj } = useLocale()

  // Basic built-in stringifiers
  const lemma: Stringifier<string> = (input) => input.replace(/_/g, " ")
  const lex: Stringifier<string> = (input) =>
    Lemgram.parse(String(input))?.toHtml(t) || String(input)
  const saldo: Stringifier<string> = (input) =>
    Saldo.parse(String(input))?.toHtml() || String(input)

  // Map common attribute names to stringifiers
  const stringifiers: Readonly<Record<string, Stringifier<string>>> = {
    lemma,
    lex,
    prefix: lex,
    suffix: lex,
    saldo,
    sense: saldo,
    // Add stringifiers possibly provided by instance plugin
    ...inject(injectionKeys.attribute.stringifiers, {}),
  }

  /** Use a stringifier configured for the given attribute */
  const stringify: Stringifier = (input) => {
    // Escape HTML in input value
    let str = escape(String(input))

    // If the attribute has a translation table, look up the value there
    if (attribute.translation) str = locObj(attribute.translation[str])

    // Apply configured stringifier, if any
    const stringifier = stringifiers[attribute.name]
    if (stringifier) {
      try {
        return stringifier(str)
      } catch (error) {
        console.error(`Error in "${attribute.name}" stringifier with value "${input}":`, error)
      }
    }

    if (attribute.type == "url")
      str = `<a href="${input}" target="_blank" rel="noopener">${str.replace(/^https?:\/\//, "")}</a>`

    if (attribute.pattern)
      str = template(attribute.pattern)({
        key: attribute.name,
        val: str,
        pos_attrs: context?.pos,
        struct_attrs: context?.struct,
      })

    // Fall back to input value
    return str
  }

  return {
    stringify,
  }
}
