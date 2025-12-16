import type { LangString } from "@/core/model/locale"
import type { AbsRelSeq } from "@/core/statistics/statistics.types"

/** Current UI language. */
export let _lang: string

/** Current UI language. */
export const getLang = (): string => _lang

/** Update global UI language variable. */
export const setLang = (langNew: string) => {
  if (langNew) _lang = langNew
}

/**
 * Get translated string from a given object.
 * @param map An object of strings keyed by language codes. Alternatively, just a string.
 * @returns The translated string, or empty string if no translation is found.
 */
export function locObj(map?: LangString, lang?: string): string {
  lang ||= _lang
  if (!map) return ""
  if (typeof map == "string") return map
  // fall back to the first value if neither the selected or default language are available
  return map[lang] ?? Object.values(map)[0] ?? ""
}

/**
 * Format a number of "relative hits" (hits per 1 million tokens), using exactly one decimal.
 * @param x Number of relative hits
 * @param lang The locale to use.
 * @returns A string with the number nicely formatted.
 */
export function formatRelativeHits(x: number | string, lang?: string) {
  lang = lang || getLang()
  return Number(x).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/**
 * Format frequency as relative or absolute using chosen mode.
 */
export function formatFrequency(absrel: AbsRelSeq, statsRelative: boolean, lang?: string) {
  const [absolute, relative] = absrel
  return statsRelative ? formatRelativeHits(relative, lang) : absolute.toLocaleString(lang)
}
