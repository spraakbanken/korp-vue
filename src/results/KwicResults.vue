<script setup lang="ts">
import { KwicProxy } from "@/core/backend/proxy/KwicProxy"
import type { ApiKwic } from "@/core/backend/types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref, watch } from "vue"
import settings from "@/core/config"
import { debounce } from "lodash"
import type { QueryParamSort } from "@/core/backend/types/query"
import KwicResultsContent from "./KwicResultsContent.vue"

const UPDATE_DELAY_MS = 500

const store = useAppStore()

const proxy = new KwicProxy(store)
const sortOptions: QueryParamSort[] = ["", "keyword", "left", "right", "random"]

const { activeSearch } = storeToRefs(store)
const hitsCount = ref(0)
const hpp = ref(settings["hits_per_page_default"])
const kwic = ref<ApiKwic[]>()
const loading = ref(false)
// TODO Read page from URL
const page = ref(1)
const sort = ref<QueryParamSort>("")

watchImmediate(activeSearch, () => {
  updateSearch()
})

function updateSearch() {
  // Initial corpus selection may not have settled yet.
  if (corpusSelection.corpora.length) doSearch(true)
  else setTimeout(() => doSearch())
}

async function doSearch(isPaging = false) {
  if (!activeSearch.value) throw new Error("No active search")
  loading.value = !isPaging
  proxy.setProgressHandler((report) => {
    hitsCount.value = report.hits || 0
  })
  const response = await proxy.makeRequest(activeSearch.value.cqp, isPaging)
  loading.value = false
  kwic.value = response.kwic
  hitsCount.value = response.hits
}

/** When search options are changed, update the search. Debounce to avoid lag in case of quick changes. */
const onOptionsChange = debounce(() => {
  store.hpp = hpp.value
  store.sort = sort.value
  doSearch()
}, UPDATE_DELAY_MS)

watch(page, () => {
  store.page = page.value - 1 // Store uses 0-based page index
  doSearch(true)
})
</script>

<template>
  <div>
    <div class="bg-body-tertiary p-2 d-flex gap-2 align-items-baseline">
      TODO Context checkbox
      <label>
        <i18n-t scope="global" keypath="result.kwic.page_size.label">
          <select
            v-model="hpp"
            class="form-select form-select-sm d-inline-block w-auto mx-1"
            @change="onOptionsChange"
          >
            <option v-for="size in settings['hits_per_page_values']" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </i18n-t>
      </label>

      <label>
        <i18n-t scope="global" keypath="result.kwic.sort.label">
          <select
            v-model="sort"
            class="form-select form-select-sm d-inline-block w-auto mx-1"
            @change="onOptionsChange"
          >
            <option v-for="option in sortOptions" :key="option" :value="option">
              {{ $t(`result.kwic.sort.${option || "default"}`) }}
            </option>
          </select>
        </i18n-t>
      </label>
    </div>

    <KwicResultsContent :hitsCount :hpp :kwic :loading v-model="page" />
  </div>
</template>
