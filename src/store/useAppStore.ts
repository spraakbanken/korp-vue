import { syncRef, useUrlSearchParams } from "@vueuse/core"
import type { HashParams } from "@/core/url"
import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import settings, { getDefaultWithin } from "@/core/config"
import { useI18n } from "vue-i18n"
import { setLang } from "@/core/i18n"
import type { ActiveSearch, Store } from "@/core/model/store"
import { paramHandler, type NormalizeOptional } from "./util"
import type { CqpQuery } from "@/core/cqp/cqp.types"

export const useAppStore = defineStore<"app", NormalizeOptional<Store>>("app", () => {
  const url = useUrlSearchParams<HashParams>("hash-params", {
    stringify: (params) => {
      return params.toString().replace(/=(&|$)/g, "$1")
    },
  })
  const { locale } = useI18n()

  /** Last executed search query. */
  const activeSearch = ref<ActiveSearch>()
  const corpus = computed({
    get: () => (url.corpus ? url.corpus.split(",").sort() : []),
    set: (ids) => (url.corpus = ids.sort().join(",")),
  })
  const cqp = paramHandler(url, "cqp", () => "[]")
  const display = paramHandler(url, "display")
  const extendedCqp = ref<string>()
  const globalFilter = ref<CqpQuery>()
  const global_filter = computed({
    get: () => (url.global_filter ? JSON.parse(atob(url.global_filter)) : {}),
    set: (obj: Record<string, string[]>) => btoa(JSON.stringify(obj)),
  })
  const hpp = paramHandler(url, "hpp", () => settings["hits_per_page_default"])
  const in_order = computed({
    get: () => url.in_order != "false",
    set: (value) => (url.in_order = value ? undefined : "false"),
  })
  const isCaseInsensitive = computed({
    get: () => url.isCaseInsensitive != undefined,
    set: (value) => (url.isCaseInsensitive = value ? "" : undefined),
  })
  const lang = paramHandler(url, "lang", () => settings["default_language"])
  const page = paramHandler(url, "page", () => "0")
  const parallel_corpora = computed({
    get: () => (url.parallel_corpora ? url.parallel_corpora.split(",") : []),
    set: (ids) => ids.join() || null,
  })
  const prefix = computed({
    get: () => url.prefix != undefined || url.mid_comp != undefined,
    set: (value) => (url.prefix = value ? "" : undefined),
  })
  const random_seed = paramHandler(url, "random_seed")
  const reading_mode = computed({
    get: () => url.reading_mode,
    set: (value) => (url.reading_mode = !!value || undefined),
  })
  const resultTab = paramHandler(url, "result_tab", () => 1)
  const search = paramHandler(url, "search")
  const searchTab = paramHandler(url, "search_tab", () => 1)
  const simpleCqp = ref<string>()
  const sort = paramHandler(url, "sort")
  const statsRelative = ref(false)
  const stats_reduce = paramHandler(url, "stats_reduce", () => "word")
  const stats_reduce_insensitive = paramHandler(url, "stats_reduce_insensitive")
  const suffix = computed({
    get: () => url.suffix != undefined || url.mid_comp != undefined,
    set: (value) => (url.suffix = value ? "" : undefined),
  })
  const within = paramHandler(url, "within", () => getDefaultWithin())

  // In parallel mode, the current query for each language is in a param like `cqp_<lang>=[...]`
  const cqpParallel = computed({
    get() {
      const out: Record<string, string> = {}
      for (const key of Object.keys(url)) {
        if (key.startsWith("cqp_")) {
          const lang = key.slice(4)
          const cqp = url[key as `cqp_${string}`]
          out[lang] = cqp
        }
      }
      return out
    },
    set(cqpMap) {
      // Remove old `cqp_<lang>` params from the URL
      for (const key of Object.keys(url))
        if (key.startsWith("cqp_") && !(key in cqpMap)) delete url[key as `cqp_${string}`]

      // Set new `cqp_<lang>` params
      Object.entries(cqpMap).forEach(([lang, cqp]) => (url[`cqp_${lang}`] = cqp))
    },
  })

  // Keep the lang param in sync with the i18n lib
  syncRef(locale, lang)

  // Sync to the non-reactive lang global
  watch(lang, (langNew) => setLang(langNew))

  // Strip `mid_comp`, it's read by `prefix` and `suffix` instead.
  url.mid_comp = undefined

  return {
    activeSearch,
    corpus,
    cqp,
    cqpParallel,
    display,
    extendedCqp,
    globalFilter,
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
    resultTab,
    search,
    searchTab,
    simpleCqp,
    sort,
    stats_reduce,
    stats_reduce_insensitive,
    statsRelative,
    suffix,
    within,
  }
})
