import { inject, ref, readonly } from 'vue'
import { get } from './backend/client'
import appSettings from '@instance/settings'
import { mapKeys, once } from 'es-toolkit'
import type { AppSettings } from './types/config.types'
import type { CorpusConfig } from './backend/types/corpus-config'
import { Deferred } from './util'
import type { CorpusInfo } from './backend/types/corpus-info'
import { computedAsync } from '@vueuse/core'

const isInitDone = ref(false)
const corpusInfoDeferred = new Deferred<Record<string, CorpusInfo>>()
let settings: (AppSettings & CorpusConfig) | undefined = undefined
const settingsDeferred = new Deferred<AppSettings & CorpusConfig>()

export function useInit() {
  const mode = inject<string>('mode')!

  async function initialize() {
    const corpusConfig = await get('corpus_config', { mode })
    settings = { ...appSettings, ...corpusConfig }
    settingsDeferred.resolve(settings)
    settingsDeferred.resolve(settings) // TODO Error?
    const data = await get('corpus_info', { corpus: Object.keys(settings.corpora).join() })
    corpusInfoDeferred.resolve(mapKeys(data.corpora, (corpus, id) => id.toLowerCase()))
    isInitDone.value = true
  }

  return {
    corpusInfo: computedAsync(() => corpusInfoDeferred.promise),
    corpusInfoPromise: corpusInfoDeferred.promise,
    initialize: once(initialize),
    isInitDone: readonly(isInitDone),
    settings: computedAsync(() => settingsDeferred.promise),
    settingsPromise: settingsDeferred.promise,
  }
}
