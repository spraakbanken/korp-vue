<script setup lang="ts">
import { KwicProxy } from "@/core/backend/proxy/KwicProxy"
import type { ApiKwic } from "@/core/backend/types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref } from "vue"
import KwicGrid from "./kwic/KwicGrid.vue"
import { massageData } from "@/core/kwic/kwic"
import settings from "@/core/config"
import { debounce } from "lodash"
import type { QueryParamSort } from "@/core/backend/types/query"

const UPDATE_DELAY_MS = 500

const store = useAppStore()

const { activeSearch } = storeToRefs(store)
const cqp = ref("[]")
const kwic = ref<ApiKwic[]>()
const proxy = new KwicProxy(store)
const hpp = ref(settings["hits_per_page_default"])
const sort = ref<QueryParamSort>("")
const sortOptions: QueryParamSort[] = ["", "keyword", "left", "right", "random"]

watchImmediate(activeSearch, () => {
  if (!store.activeSearch) return
  cqp.value = store.activeSearch.cqp
  updateSearch()
})

function updateSearch() {
  // Initial corpus selection may not have settled yet.
  if (corpusSelection.corpora.length) doSearch()
  else setTimeout(() => doSearch())
}

async function doSearch() {
  const response = await proxy.makeRequest(cqp.value)
  kwic.value = response.kwic
}

/** When search options are changed, update the search. Debounce to avoid lag in case of quick changes. */
const onOptionsChange = debounce(() => {
  store.hpp = hpp.value
  store.sort = sort.value
  doSearch()
}, UPDATE_DELAY_MS)
</script>

<template>
  <div>
    <div class="bg-body-tertiary p-2 d-flex gap-2 align-items-baseline">
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

    <KwicGrid v-if="kwic" :data="massageData(kwic)" />
  </div>
</template>
