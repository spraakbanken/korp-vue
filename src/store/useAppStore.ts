import { syncRef, useUrlSearchParams } from "@vueuse/core"
import type { HashParams } from "@/core/url"
import { computed, ref, watch, type WritableComputedRef } from "vue"
import { defineStore } from "pinia"
import settings from "@/core/config"
import { useI18n } from "vue-i18n"
import { setLang } from "@/core/i18n"
import type { ActiveSearch } from "./appStore.types"
import type { Store } from "@/core/model/store"

/** This converts `a?: A` to `a: A | undefined`, which is needed for correct typing of storeToRefs(). */
type NormalizeOptional<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? Exclude<T[K], undefined> | undefined : T[K]
}

/** Helper for creating a Writable Computed to proxy an object property. */
function paramHandler<T extends object, K extends keyof T>(
  params: Partial<T>,
  name: K,
  getDefault?: () => T[K],
): WritableComputedRef<T[K]> {
  return computed({
    get: () => params[name] || (getDefault?.() as T[K]),
    set: (value) => (params[name] = value != getDefault?.() ? value : undefined),
  })
}

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
