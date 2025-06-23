import type { AppParams } from '@/url.types'
import { useUrlSearchParams } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const params = useUrlSearchParams<AppParams>('hash-params')

  const corpus = computed<string[]>({
    get: () => params.corpus?.split(',') || [],
    set: (ids) => (params.corpus = ids?.length ? ids.join() : undefined),
  })

  return {
    corpus,
  }
})
