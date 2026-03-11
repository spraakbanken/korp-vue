import { syncRef } from "@vueuse/core"
import { useAuth } from "./auth/useAuth"
import { useUrlParams } from "./useUrlParams"
import useHistory from "./useHistory"
import { storeToRefs } from "pinia"
import { useAppStore } from "./store/useAppStore"
import { getTimeData } from "./core/backend/timedata"
import { setCorpusListing } from "./core/corpora/corpusListing"
import { CorpusSet } from "./core/corpora/CorpusSet"
import { CorpusSetParallel } from "./core/corpora/CorpusSetParallel"
import type { Corpus } from "./core/config/corpusConfig.types"
import type { CorpusParallel } from "./core/config/corpusConfigRaw.types"
import { loadCorpusConfig } from "./core/config/corpusConfig"
import { useI18n } from "vue-i18n"
import settings from "./core/config"
import { readonly, ref } from "vue"

const initDone = ref(false)

export default function useInit() {
  const auth = useAuth()
  const { locale } = useI18n()

  async function init() {
    // Initialize authentication
    await auth.init(settings)

    // Fetch config and info
    const corpusConfig = await loadCorpusConfig(settings)

    // Merge into global settings
    Object.assign(settings, corpusConfig)

    // Create global corpusListing and corpusSelection
    const corpora = Object.values(settings.corpora)
    const corpusListing = settings.parallel
      ? new CorpusSetParallel(corpora as Corpus<CorpusParallel>[])
      : new CorpusSet(corpora)
    setCorpusListing(corpusListing)

    // Load corpus time data in the background
    getTimeData()

    // Setup store and related services
    const store = useAppStore()
    const { lang } = storeToRefs(store)
    useHistory(store)
    useUrlParams()

    // Keep the lang param in sync with the i18n lib
    syncRef(locale, lang)

    initDone.value = true
  }

  return {
    init,
    initDone: readonly(initDone),
  }
}
