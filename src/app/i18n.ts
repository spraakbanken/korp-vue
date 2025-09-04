import { createI18n } from 'vue-i18n'
import eng from '@/locale/eng.yaml'
import swe from '@/locale/swe.yaml'
import settings from '@instance/settings'

export type Locale = Record<string, string>

export type LocalesByLang = Record<string, Locale>

const messages: LocalesByLang = { eng, swe }

export default async function setupI18n(locale: string) {
  // Load instance locales.
  const instanceLocales = await loadInstanceLocales()

  return createI18n({
    locale,
    fallbackLocale: 'eng',
    messages: { eng, swe, ...instanceLocales },
  })
}

/** Load named locales */
async function loadInstanceLocales(): Promise<LocalesByLang> {
  const langs = settings.languages.map((item) => item.value).filter((lang) => !(lang in messages))
  // const locales = await Promise.all(langs.map(loadInstanceLocale))
  const locales = await Promise.all(
    langs.map(async (lang) => (await import(`@instance/locale/${lang}.yaml`)).default),
  )
  return Object.fromEntries(langs.map((lang, i) => [lang, locales[i]]))
}
