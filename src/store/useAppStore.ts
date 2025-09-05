import { syncRef, useUrlSearchParams } from '@vueuse/core'
import type { HashParams } from '@/core/url'
import { computed } from 'vue'
import { defineStore } from 'pinia'
import settings from '@/core/config'
import { useI18n } from 'vue-i18n'

export const useAppStore = defineStore('app', () => {
  const url = useUrlSearchParams<HashParams>('hash-params', {
    stringify: (params) => {
      return params.toString().replace(/=(&|$)/g, '$1')
    },
  })
  const { locale } = useI18n()

  const corpus = computed({
    get: () => url.corpus?.split(',').sort() || [],
    set: (ids) => (url.corpus = ids.sort().join(',')),
  })
  const lang = computed({
    get: () => url.lang || settings.default_language,
    set: (value) => (url.lang = value != settings.default_language ? value : undefined),
  })

  // Keep the lang param in sync with the i18n lib
  syncRef(locale, lang)

  return {
    corpus,
    lang,
  }
})
