import { useUrlSearchParams, watchImmediate } from "@vueuse/core"
import type { HashParams } from "./core/url"
import { useAppStore } from "./store/useAppStore"
import settings, { getDefaultWithin } from "./core/config"
import type { Store } from "./core/model/store"

export function useUrlParams() {
  const url = useUrlSearchParams<HashParams>("hash-params", {
    stringify: (params) => {
      return params.toString().replace(/=(&|$)/g, "$1")
    },
  })

  const store = useAppStore()

  /** Establish sync from a URL param to corresponding store param. */
  function watchUrl<K extends keyof HashParams & keyof Store>(
    paramName: K,
    parseParam?: (value: HashParams[K]) => Store[K],
  ) {
    watchImmediate(
      () => url[paramName],
      (value) => store.$patch({ [paramName]: parseParam ? parseParam(value) : value }),
    )
  }

  // Sync from URL to store
  watchUrl("corpus", (value) => (value ? value.split(",") : []))
  watchUrl("cqp")
  watchUrl("display")
  watchUrl("global_filter", (value) => (value ? JSON.parse(atob(value)) : {}))
  watchUrl("hpp", (value) => (value && parseInt(value)) || settings["hits_per_page_default"])
  watchUrl("in_order", (value) => value != "false")
  watchUrl("isCaseInsensitive", (value) => value != undefined)
  watchUrl("lang", (value) => value || settings["default_language"])
  watchUrl("page", (value) => (value ? parseInt(value) : 0))
  watchUrl("parallel_corpora", (value) => (value ? value.split(",") : []))
  watchUrl("prefix", (value) => value != undefined || url.mid_comp != undefined)
  watchUrl("random_seed", (value) => (value ? parseInt(value) : undefined))
  watchUrl("reading_mode", (value) => value != undefined)
  watchUrl("result_tab", (value) => (value && parseInt(value)) || 1)
  watchUrl("search")
  watchUrl("search_tab", (value) => (value && parseInt(value)) || 0)
  watchUrl("sort")
  watchUrl("stats_reduce", (value) => value || "word")
  watchUrl("stats_reduce_insensitive", (value) => value || "")
  watchUrl("suffix", (value) => value != undefined || url.mid_comp != undefined)
  watchUrl("within", (value) => value || getDefaultWithin())

  // TODO Special handling of cqpParallel: multiple URL params but one store variable.
  // watchDeep?

  // `mid_comp` is deprecated; use prefix/suffix instead
  url.mid_comp = undefined

  // Sync from store to URL
  store.$subscribe(() => {
    url.corpus = store.corpus.sort().join() || undefined
    url.cqp = store.cqp || undefined
    url.display = store.display || undefined
    url.global_filter =
      Object.keys(store.global_filter).length > 0
        ? btoa(JSON.stringify(store.global_filter))
        : undefined
    url.hpp = store.hpp != settings["hits_per_page_default"] ? `${store.hpp}` : undefined
    url.in_order = store.in_order ? undefined : "false"
    url.isCaseInsensitive = store.isCaseInsensitive ? "" : undefined
    url.lang = store.lang != settings["default_language"] ? store.lang : undefined
    url.page = store.page == 0 ? undefined : `${store.page}`
    url.parallel_corpora = store.parallel_corpora.join() || undefined
    url.prefix = store.prefix ? "" : undefined
    url.random_seed = store.random_seed ? `${store.random_seed}` : undefined
    url.reading_mode = store.reading_mode ? "" : undefined
    url.result_tab = store.result_tab != 1 ? `${store.result_tab}` : undefined
    url.search = store.search || undefined
    url.search_tab = store.search_tab != 0 ? `${store.search_tab}` : undefined
    url.sort = store.sort || undefined
    url.stats_reduce = store.stats_reduce == "word" ? undefined : store.stats_reduce
    url.stats_reduce_insensitive = store.stats_reduce_insensitive || undefined
    url.suffix = store.suffix ? "" : undefined
    url.within = store.within == getDefaultWithin() ? undefined : store.within
  })

  // Trigger a URL -> store -> URL sync round.
  store.$patch({})
}
