import { syncRef, useUrlSearchParams } from "@vueuse/core"
import type { HashParams } from "@/core/url"
import { computed, ref, watch, type WritableComputedRef } from "vue"
import { defineStore } from "pinia"
import settings from "@/core/config"
import { useI18n } from "vue-i18n"
import { setLang } from "@/core/i18n"
import type { ActiveSearch } from "./appStore.types"
import type { Store } from "@/core/model/store"

function paramHandler<T extends object, K extends keyof T, U>(
  params: Partial<T>,
  name: K,
  getDefault?: () => U,
  options: {
    /** Decode param value */
    decode?: (value?: T[K]) => U
    /** Encode value for param */
    encode?: (value: U) => T[K]
  } = {},
): WritableComputedRef<U> {
  const decode = options.decode || ((x) => x as U)
  const encode = options.encode || ((x) => x as T[K])
  return computed({
    get: () => decode(params[name]) || (getDefault?.() as U),
    set: (value) => {
      const encoded = encode(value)
      params[name] = encoded != getDefault?.() ? encoded : undefined
    },
  })
}

export const useAppStore = defineStore<"app", Store>("app", () => {
  const url = useUrlSearchParams<HashParams>("hash-params", {
    stringify: (params) => {
      return params.toString().replace(/=(&|$)/g, "$1")
    },
  })
  const { locale } = useI18n()

  /** Last executed search query. */
  const activeSearch = ref<ActiveSearch>()

  // const corpus = computed({
  //   get: () => (url.corpus ? url.corpus.split(",").sort() : []),
  //   set: (ids) => (url.corpus = ids.sort().join(",")),
  // })
  const corpus = paramHandler(url, "corpus", () => [], {
    decode: (str) => (str ? str.split(",").sort() : []),
    encode: (ids) => ids.sort().join(),
  })
  const hpp = paramHandler(url, "hpp", () => settings["hits_per_page_default"])
  const lang = paramHandler(url, "lang", () => settings["default_language"])
  const page = paramHandler(url, "page", () => "0")
  const search = paramHandler(url, "search")

  // Keep the lang param in sync with the i18n lib
  syncRef(locale, lang)

  // Sync to the non-reactive lang global
  watch(lang, (langNew) => setLang(langNew))

  return {
    activeSearch,
    corpus,
    hpp,
    lang,
    page,
    search,
  }
})
