import { createI18n } from "vue-i18n"
import eng from "@/locale/eng.yaml"
import swe from "@/locale/swe.yaml"
import settings from "@instance/settings"

/** Message sets by language code */
type LocalesByLang = Record<string, Locale>

/** Localized messages by key */
type Locale = Record<string, string>

export default async function setupI18n(locale: string) {
  // Load instance locales.
  const messages = await loadInstanceLocales()

  // Add default messages
  messages.eng = { ...eng, ...messages.eng }
  messages.swe = { ...swe, ...messages.swe }

  // Passing `false` as type arg helps to infer the return type as a non-legacy I18n instance.
  return createI18n<false>({
    legacy: false,
    locale,
    fallbackLocale: "eng",
    messages,
  })
}

/** Load named locales */
async function loadInstanceLocales(): Promise<LocalesByLang> {
  const langs = settings.languages.map((item) => item.value)
  const locales = await Promise.all(
    langs.map(async (lang) => (await import(`@instance/locale/${lang}.yaml`)).default),
  )
  return Object.fromEntries(langs.map((lang, i) => [lang, locales[i]]))
}
