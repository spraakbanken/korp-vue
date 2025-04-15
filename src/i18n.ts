import { createI18n } from 'vue-i18n'
import en from '@/locale/en.yaml'
import sv from '@/locale/sv.yaml'
import instanceLocales from '@instance/locale'

export default function setupI18n(locale: string) {
  return createI18n({
    locale,
    fallbackLocale: 'en',
    messages: { en, sv, ...instanceLocales },
  })
}
