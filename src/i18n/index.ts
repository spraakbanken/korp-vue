import settings from '@/core/config'
import type { LangString } from '@/core/model/locale'

/**
 * Get translated string from a given object.
 * @param map An object of strings keyed by language codes. Alternatively, just a string.
 * @param lang The code of the language to translate to. Defaults to the global current language.
 * @returns The translated string, or undefined if no translation is found.
 */
export function locObj(map: undefined, lang: string): undefined
export function locObj(map: LangString, lang: string): string
export function locObj(map: LangString | undefined, lang: string) {
  if (!map) return undefined
  if (typeof map == 'string') return map
  lang ??= settings.default_language
  // fall back to the first value if neither the selected or default language are available
  return map[lang] ?? Object.values(map)[0]
}
