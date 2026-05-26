<script setup lang="ts">
import { KwicProxy } from "@/core/backend/proxy/KwicProxy"
import { useAppStore } from "@/store/useAppStore"
import { syncRef, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref, watch } from "vue"
import settings from "@/core/config"
import { debounce } from "lodash-es"
import type { QueryParamSort } from "@/core/backend/types/query"
import KwicResultsContent from "./KwicResultsContent.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import OptionsBar from "@/components/OptionsBar.vue"
import { massageData, type Row } from "@/core/kwic/kwic"
import type { HitsDistribution, QueryData } from "@/core/backend/proxy/QueryProxyBase"
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import vFadeIfLoading from "@/components/vFadeIfLoading"
import ErrorBox from "@/components/ErrorBox.vue"
import useError from "@/components/useError"
import useSearchStore from "@/search/useSearchStore"
import { useMatomo } from "vue3-matomo"
import KwicExportButton from "./KwicExportButton.vue"

const UPDATE_DELAY_MS = 500

const progress = defineModel<number>("progress")

const store = useAppStore()
const { activeSearch } = storeToRefs(useSearchStore())
const { setError, clearError, errorMessage } = useError()
const matomo = useMatomo()

const sortOptions: QueryParamSort[] = ["", "keyword", "left", "right", "random"]

const { page } = storeToRefs(store)
/** Model for the "Show context" option */
const context = ref(store.reading_mode)
const distribution = ref<HitsDistribution[]>()
const hitsCount = ref(0)
/** Controls result display style */
const isReading = ref(store.reading_mode || !store.in_order)
const hpp = ref(store.hpp)
const kwic = ref<Row[]>()
const loading = ref(false)
const pageLocal = ref(1)
const sort = ref<QueryParamSort>(store.sort)
/** Flags if the current running request will be shown in reading mode */
let isCurrentRequestReading = false

const proxy = new KwicProxy(store).setProgressHandler((report) => {
  // Show first KWIC page when available
  if ("kwic" in report.data && report.data.kwic) {
    kwic.value = massageData(report.data.kwic)
    // Use remembered state to control the result display
    isReading.value = isCurrentRequestReading
  }
  distribution.value = undefined
  if (report.hits !== null) hitsCount.value = report.hits
  progress.value = report.percent
})

// Store uses 0-based page index, UI uses 1-based page index
syncRef(page, pageLocal, { transform: { ltr: (v) => v + 1, rtl: (v) => v - 1 } })

// Watch the active search query
watchImmediate(activeSearch, () => {
  updateRandomSeed()
  doSearch()
})

async function doSearch(reuseCounts = false) {
  // Empty search is possible when doing comparison first
  if (!activeSearch.value) return
  proxy.abort()
  clearError()
  progress.value = 0
  loading.value = !reuseCounts
  // Remember options affecting result display in case they are changed while the request is ongoing
  isCurrentRequestReading = context.value || !store.in_order

  let response: QueryData
  try {
    response = await proxy.makeRequest(activeSearch.value.cqp, reuseCounts)
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    setError(error)
    return
  }

  // No need to set `kwic` and `hitsCount` as they are set in the progress handler.
  loading.value = false
  distribution.value = response.distribution
  // For cached responses, the progress report has an empty hits count, so setting `hitsCount` in progress handler is not enough
  hitsCount.value = response.hits
}

/** Update the sort randomization seed if needed */
function updateRandomSeed() {
  // Unset seed if sorting is not random
  if (sort.value != "random") {
    store.random_seed = undefined
    return
  }

  // On the initial search, do nothing, use the unchanged seed from the URL/store
  // On subsequent searches, generate a new seed
  if (kwic.value) {
    store.random_seed = Math.ceil(Math.random() * 10e6)
  }
}

/** When search options are changed, update the search. Debounce to avoid lag in case of quick changes. */
const onOptionsChange = debounce(() => {
  if (store.sort != sort.value) updateRandomSeed()
  store.hpp = hpp.value
  store.sort = sort.value
  store.reading_mode = context.value
  doSearch(true)
}, UPDATE_DELAY_MS)

watch(pageLocal, () => {
  matomo.value?.trackEvent("KWIC", "Change page")
  doSearch(true)
})

watch(context, () =>
  matomo.value?.trackEvent("KWIC", "Toggle context", context.value ? "Show" : "Hide"),
)

watch(sort, () => matomo.value?.trackEvent("KWIC", "Change sort", sort.value || "default"))
</script>

<template>
  <div class="vstack gap-2">
    <OptionsBar>
      <label class="form-check form-check-label">
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

      <template #end>
        <KwicExportButton :kwic :proxy :totalHits="hitsCount" />
      </template>
    </OptionsBar>

    <ErrorBox v-if="errorMessage" v-bind="errorMessage" class="mx-auto mb-0" />

    <KwicResultsContent
      v-else
      :corpora="activeSearch.corpora"
      :distribution
      :hitsCount
      :hpp
      :isReading
      :kwic
      :loading
      v-model="pageLocal"
      v-fade-if-loading="progress"
    />
  </div>
</template>
