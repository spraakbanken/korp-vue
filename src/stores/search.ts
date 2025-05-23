import { defineStore } from 'pinia'
import { useUrlSearchParams } from '@vueuse/core'
import type { SearchParams } from '@/url.types'
import { computed } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const params = useUrlSearchParams<SearchParams>('hash-params')

  // Wrap params with rename, in/out converters and default values.
  // cqp has a default value
  const cqp = computed({
    get: () => params.cqp || '[]',
    set: (x) => (params.cqp = x != '[]' ? x : undefined),
  })
  // freeOrder is renamed and converted
  const freeOrder = computed({
    get: () => params.in_order == 'false',
    set: (x) => (params.in_order = x ? 'false' : undefined),
  })
  // prefix is boolean
  // TODO Can we make it write `prefix` instead of `prefix=`?
  const prefix = computed({
    get: () => params.prefix != null,
    set: (x) => (params.prefix = x ? '' : undefined),
  })
  // searchTab has a default falsy value
  const searchTab = computed({
    get: () => params.search_tab || '',
    set: (x) => (params.search_tab = x || undefined),
  })

  return {
    cqp,
    freeOrder,
    prefix,
    searchTab,
  }
})
