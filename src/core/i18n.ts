import type { LangString } from '@/core/model/locale'

/** Current UI language. */
export let _lang: string

/** Update global UI language variable. */
export const setLang = (langNew: string) => (_lang = langNew)

/**
 * Get translated string from a given object.
 * @param map An object of strings keyed by language codes. Alternatively, just a string.
 * @returns The translated string, or undefined if no translation is found.
 */
export function locObj(map?: LangString, lang?: string): string {
  lang ||= _lang
  if (!map) return ''
  if (typeof map == 'string') return map
  // fall back to the first value if neither the selected or default language are available
  return map[lang] ?? Object.values(map)[0]
}
