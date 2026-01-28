import { syncRef, watchImmediate } from "@vueuse/core"
import { ref } from "vue"
import { defineStore } from "pinia"
import settings, { getDefaultWithin } from "@/core/config"
import { useI18n } from "vue-i18n"
import { setLang } from "@/core/i18n"
import type { ActiveSearch, Store } from "@/core/model/store"
import { type NormalizeOptional } from "./util"

export const useAppStore = defineStore<"app", NormalizeOptional<Store>>("app", () => {
  const { locale } = useI18n()

  /** Last executed search query. */
  const activeSearch = ref<ActiveSearch>()
  const corpus = ref<string[]>([])
  const cqp = ref("[]")
  const cqpParallel = ref({})
  const display = ref("")
  const extendedCqp = ref<string>()
  const global_filter = ref({})
  const hpp = ref(settings["hits_per_page_default"])
  const in_order = ref(false)
  const isCaseInsensitive = ref(false)
  const lang = ref(settings["default_language"])
  const page = ref(0)
  const parallel_corpora = ref<string[]>([])
  const prefix = ref(false)
  const random_seed = ref<number>()
  const reading_mode = ref(false)
  const result_tab = ref(1)
  const search = ref("")
  const search_tab = ref(0)
  const simpleCqp = ref<string>()
  const sort = ref("")
  const statsRelative = ref(false)
  const stats_reduce = ref("word")
  const stats_reduce_insensitive = ref("")
  const suffix = ref(false)
  const within = ref(getDefaultWithin())

  // Keep the lang param in sync with the i18n lib
  syncRef(locale, lang)

  // Sync to the non-reactive lang global
  watchImmediate(lang, (langNew) => setLang(langNew))

  return {
    activeSearch,
    corpus,
    cqp,
    cqpParallel,
    display,
    extendedCqp,
    global_filter,
    hpp,
    isCaseInsensitive,
    in_order,
    lang,
    page,
    parallel_corpora,
    prefix,
    random_seed,
    reading_mode,
    result_tab,
    search,
    search_tab,
    simpleCqp,
    sort,
    stats_reduce,
    stats_reduce_insensitive,
    statsRelative,
    suffix,
    within,
  }
})
