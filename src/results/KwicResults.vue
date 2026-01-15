<script setup lang="ts">
import { KwicProxy } from "@/core/backend/proxy/KwicProxy"
import type { ApiKwic } from "@/core/backend/types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { syncRef, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref, watch } from "vue"
import settings from "@/core/config"
import { debounce } from "lodash"
import type { QueryParamSort } from "@/core/backend/types/query"
import KwicResultsContent from "./kwic/KwicResultsContent.vue"
import HelpBadge from "@/components/HelpBadge.vue"

const UPDATE_DELAY_MS = 500

const store = useAppStore()

const proxy = new KwicProxy(store)
const sortOptions: QueryParamSort[] = ["", "keyword", "left", "right", "random"]

const { activeSearch, page } = storeToRefs(store)
/** Model for the "Show context" option */
const context = ref(store.reading_mode)
const hitsCount = ref(0)
/** Controls result display style */
const isReading = ref(store.reading_mode || !store.in_order)
const hpp = ref(settings["hits_per_page_default"])
const kwic = ref<ApiKwic[]>()
const loading = ref(false)
const pageLocal = ref(1)
const sort = ref<QueryParamSort>("")

// Store uses 0-based page index, UI uses 1-based page index
syncRef(page, pageLocal, { transform: { ltr: (v) => v + 1, rtl: (v) => v - 1 } })

watchImmediate(activeSearch, () => {
  // Initial corpus selection may not have settled yet.
  if (corpusSelection.corpora.length) doSearch()
  else setTimeout(() => doSearch())
})

async function doSearch(isPaging = false) {
  if (!activeSearch.value) throw new Error("No active search")
  loading.value = !isPaging
  // Remember options affecting result display in case they are changed while the request is ongoing
  const willBeReading = context.value || !store.in_order
  proxy.setProgressHandler((report) => {
    hitsCount.value = report.hits || 0
  })
  const response = await proxy.makeRequest(activeSearch.value.cqp, isPaging)
  // Use remembered state to control the result display
  isReading.value = willBeReading
  loading.value = false
  kwic.value = response.kwic
  hitsCount.value = response.hits
}

/** When search options are changed, update the search. Debounce to avoid lag in case of quick changes. */
const onOptionsChange = debounce(() => {
  store.hpp = hpp.value
  store.sort = sort.value
  store.reading_mode = context.value
  doSearch()
}, UPDATE_DELAY_MS)

watch(pageLocal, () => doSearch(true))
</script>

<template>
  <div>
    <div class="bg-body-tertiary p-2 d-flex gap-2 align-items-baseline">
      <label class="form-check-label">
        <input
          type="checkbox"
          v-model="context"
          class="form-check-input"
          @change="onOptionsChange"
        />
        {{ $t("result.kwic.show_context") }}
        <HelpBadge :text="$t('result.kwic.show_context.help')" />
      </label>

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

    <KwicResultsContent :hitsCount :hpp :isReading :kwic :loading v-model="pageLocal" />
  </div>
</template>
