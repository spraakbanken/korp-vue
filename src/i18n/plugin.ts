import { createI18n } from "vue-i18n"
import eng from "@/locale/eng.yaml"
import swe from "@/locale/swe.yaml"
import settings from "@instance/settings"

/** Message sets by language code */
type LocalesByLang = Record<string, Locale>

/** Localized messages by key */
type Locale = Record<string, string>

/** Standard locales */
const messages: LocalesByLang = { eng, swe }

export default async function setupI18n(locale: string) {
  // Load instance locales.
  const instanceLocales = await loadInstanceLocales()

  // Passing `false` as type arg helps to infer the return type as a non-legacy I18n instance.
  return createI18n<false>({
    legacy: false,
    locale,
    fallbackLocale: "eng",
    messages: { eng, swe, ...instanceLocales },
    datetimeFormats: {
      eng: {
        long: {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      },
      swe: {
        long: {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      },
    },
  })
}

/** Load named locales */
async function loadInstanceLocales(): Promise<LocalesByLang> {
  const langs = settings.languages.map((item) => item.value).filter((lang) => !(lang in messages))
  const locales = await Promise.all(
    langs.map(async (lang) => (await import(`@instance/locale/${lang}.yaml`)).default),
  )
  return Object.fromEntries(langs.map((lang, i) => [lang, locales[i]]))
}
