import { createI18n } from 'vue-i18n'
import eng from '@/locale/eng.yaml'
import swe from '@/locale/swe.yaml'
// TODO Make this optional
import instanceLocales from '@instance/locale'

export default function setupI18n(locale: string) {
  return createI18n({
    locale,
    fallbackLocale: 'eng',
    messages: { eng, swe, ...instanceLocales },
  })
}
