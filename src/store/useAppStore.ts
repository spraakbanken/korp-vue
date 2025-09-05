import { useUrlSearchParams } from '@vueuse/core'
import type { HashParams } from '@/core/url'
import { computed } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const url = useUrlSearchParams<HashParams>('hash-params', {
    stringify: (params) => {
      return params.toString().replace(/=(&|$)/g, '$1')
    },
  })

  const corpus = computed({
    get: () => url.corpus?.split(',').sort() || [],
    set: (ids) => (url.corpus = ids.sort().join(',')),
  })

  return {
    corpus,
  }
})
