<script setup lang="ts">
import { KwicProxy } from "@/core/backend/proxy/KwicProxy"
import { useAppStore } from "@/store/useAppStore"
import { syncRef, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { computed, ref, watch } from "vue"
import settings from "@/core/config"
import { debounce } from "lodash-es"
import type { QueryParamSort } from "@/core/backend/types/query"
import KwicResultsContent from "./KwicResultsContent.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import OptionsBar from "@/components/OptionsBar.vue"
import { massageData } from "@/core/kwic/kwic"
import vFadeIfLoading from "@/components/vFadeIfLoading"
import useSearchStore from "@/search/useSearchStore"
import { useMatomo } from "vue3-matomo"
import KwicExportButton from "./KwicExportButton.vue"
import { useResult } from "../useResult"
import ResultsDisplay from "../ResultsDisplay.vue"

const UPDATE_DELAY_MS = 500

const progress = defineModel<number>("progress")

const store = useAppStore()
const { activeSearch } = storeToRefs(useSearchStore())
const matomo = useMatomo()

const sortOptions: QueryParamSort[] = ["", "keyword", "left", "right", "random"]

const { page } = storeToRefs(store)
/** Model for the "Show context" option */
const context = ref(store.reading_mode)
/** Controls result display style */
const isReading = ref(store.reading_mode || !store.in_order)
const hpp = ref(store.hpp)
const pageLocal = ref(1)
const sort = ref<QueryParamSort>(store.sort)

const proxy = new KwicProxy()

// Store uses 0-based page index, UI uses 1-based page index
syncRef(page, pageLocal, { transform: { ltr: (v) => v + 1, rtl: (v) => v - 1 } })

async function load(updating = false) {
  // Empty search is possible when doing comparison first
  if (!activeSearch.value) return

  // Set up progress handler
  let hasFirstPage = false
  // Remember if the current running request will be shown in reading mode
  const isReadingNew = context.value || !store.in_order
  proxy.setProgressHandler((report) => {
    // Since `data` is a shallowRef, make sure to replace the object.
    data.value = { distribution: [], hits: 0, kwic: [], ...data.value }
    // Show first KWIC page when available
    if (!hasFirstPage && "kwic" in report.data && report.data.kwic) {
      data.value.kwic = report.data.kwic
      hasFirstPage = true
      isReading.value = isReadingNew
    }
    if (report.hits !== null) data.value.hits = report.hits
    progress.value = report.percent
  })

  return proxy.makeRequest(activeSearch.value.cqp, store.hpp, {
    reuseCounts: updating,
    isReading: store.reading_mode,
    defaultWithin: store.within,
    page: store.page,
    freeOrder: !store.in_order,
    randomSeed: store.random_seed,
    sort: store.sort,
  })
}

const { data, errorMessage, state, loadResult } = useResult(progress, load, proxy)

const distribution = computed(() => data.value?.distribution)
const hitsCount = computed(() => data.value?.hits || 0)
const kwic = computed(() => data.value && massageData(data.value.kwic))

// Watch the active search query
watchImmediate(activeSearch, () => {
  updateRandomSeed()
  loadResult()
})

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
  loadResult(true)
}, UPDATE_DELAY_MS)

watch(pageLocal, () => {
  matomo.value?.trackEvent("KWIC", "Change page")
  loadResult(true)
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
            class="form-select form-select-sm d-inline-block w-auto mx-1 text-end"
            @change="onOptionsChange"
          >
            <option v-for="size in settings['hits_per_page_values']" :key="size" :value="size">
              {{ $n(size) }}
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

    <ResultsDisplay :errorMessage :state :populated="!!hitsCount">
      <KwicResultsContent
        :corpora="activeSearch?.corpora"
        :distribution
        :hitsCount
        :hpp
        :isReading
        :kwic
        :state
        v-model="pageLocal"
        v-fade-if-loading="!kwic || state == 'updating' ? progress : undefined"
      />
    </ResultsDisplay>
  </div>
</template>
