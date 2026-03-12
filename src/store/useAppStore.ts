import { watchImmediate } from "@vueuse/core"
import { ref } from "vue"
import { defineStore } from "pinia"
import settings, { getDefaultWithin } from "@/core/config"
import { setLang } from "@/core/i18n"
import type { Store } from "@/core/model/store"
import { type NormalizeOptional } from "./util"

export const useAppStore = defineStore<"app", NormalizeOptional<Store>>("app", () => {
  const corpus = ref<string[]>([])
  const cqp = ref("[]")
  const cqpParallel = ref({})
  const display = ref("")
  const global_filter = ref({})
  const hpp = ref(settings["hits_per_page_default"])
  const in_order = ref(false)
  const isCaseInsensitive = ref(false)
  const lang = ref(settings["default_language"])
  const page = ref(0)
  const prefix = ref(false)
  const random_seed = ref<number>()
  const reading_mode = ref(false)
  const result_tab = ref(1)
  const search = ref("")
  const search_tab = ref(0)
  const sort = ref("")
  const statsRelative = ref(false)
  const stats_reduce = ref("word")
  const stats_reduce_insensitive = ref("")
  const suffix = ref(false)
  const within = ref(getDefaultWithin())

  // Sync to the non-reactive lang global
  watchImmediate(lang, (langNew) => setLang(langNew))

  return {
    corpus,
    cqp,
    cqpParallel,
    display,
    global_filter,
    hpp,
    isCaseInsensitive,
    in_order,
    lang,
    page,
    prefix,
    random_seed,
    reading_mode,
    result_tab,
    search,
    search_tab,
    sort,
    stats_reduce,
    stats_reduce_insensitive,
    statsRelative,
    suffix,
    within,
  }
})
