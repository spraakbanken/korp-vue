import { syncRef, useUrlSearchParams } from "@vueuse/core"
import type { HashParams } from "@/core/url"
import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import settings from "@/core/config"
import { useI18n } from "vue-i18n"
import { setLang } from "@/core/i18n"
import type { ActiveSearch } from "./appStore.types"
import type { Store } from "@/core/model/store"
import { paramHandler, type NormalizeOptional } from "./util"

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
  const hpp = paramHandler(url, "hpp", () => settings["hits_per_page_default"])
  const in_order = computed({
    get: () => url.in_order != "false",
    set: (value) => (url.in_order = value ? undefined : "false"),
  })
  const lang = paramHandler(url, "lang", () => settings["default_language"])
  const page = paramHandler(url, "page", () => "0")
  const resultTab = paramHandler(url, "result_tab", () => 1)
  const search = paramHandler(url, "search")

  // Keep the lang param in sync with the i18n lib
  syncRef(locale, lang)

  // Sync to the non-reactive lang global
  watch(lang, (langNew) => setLang(langNew))

  return {
    activeSearch,
    corpus,
    hpp,
    in_order,
    lang,
    page,
    search,
    resultTab,
  }
})
