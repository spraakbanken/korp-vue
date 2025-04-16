import { createI18n } from 'vue-i18n'
import eng from '@/locale/eng.yaml'
import swe from '@/locale/swe.yaml'
import settings from '@instance/settings'

const messages = { eng, swe }

export default function setupI18n(locale: string) {
  const i18n = createI18n({
    locale,
    fallbackLocale: 'eng',
    messages,
  })

  // Add instance locales async.
  // TODO App code may be using locales before they are loaded.
  loadInstanceLocales().then((locales) =>
    Object.entries(locales).forEach(([locale, messages]) => {
      i18n.global.setLocaleMessage(locale, messages)
    }),
  )

  return i18n
}

async function loadInstanceLocales(): Promise<Record<string, Record<string, string>>> {
  const langs: string[] = settings.languages
    .map((item) => item.value)
    .filter((lang) => !(lang in messages))
  const locales = await Promise.all(langs.map((lang) => loadInstanceLocale(lang)))
  return Object.fromEntries(langs.map((lang, i) => [lang, locales[i]]))
}

async function loadInstanceLocale(code: string): Promise<Record<string, string>> {
  try {
    return (await import(`@instance/locale/${code}.yaml`)).default
  } catch (error) {
    console.error(`Could not load locale ${code}:`, error)
    return {}
  }
}
