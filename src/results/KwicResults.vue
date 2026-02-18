<script setup lang="ts">
import { KwicProxy } from "@/core/backend/proxy/KwicProxy"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { syncRef, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref, watch } from "vue"
import settings from "@/core/config"
import { debounce } from "lodash-es"
import type { QueryParamSort } from "@/core/backend/types/query"
import KwicResultsContent from "./kwic/KwicResultsContent.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import OptionsBar from "@/components/OptionsBar.vue"
import ExportButton from "./ExportButton.vue"
import { transformData, type ExportType } from "@/core/kwic/export"
import type { Row } from "@/core/kwic/kwic"
import type { HitsDistribution } from "@/core/backend/proxy/QueryProxyBase"
import { isAbortError } from "@/core/backend/proxy/ProxyBase"

const UPDATE_DELAY_MS = 500

const progress = defineModel<number>("progress")

const store = useAppStore()

const sortOptions: QueryParamSort[] = ["", "keyword", "left", "right", "random"]

const { activeSearch, page } = storeToRefs(store)
/** Model for the "Show context" option */
const context = ref(store.reading_mode)
const distribution = ref<HitsDistribution[]>()
const exportType = ref<ExportType>("kwic")
const hitsCount = ref(0)
/** Controls result display style */
const isReading = ref(store.reading_mode || !store.in_order)
const hpp = ref(settings["hits_per_page_default"])
const kwic = ref<Row[]>()
const pageLocal = ref(1)
const sort = ref<QueryParamSort>("")

const proxy = new KwicProxy(store).setProgressHandler((report) => {
  // TODO Show first KWIC page when available
  distribution.value = undefined
  hitsCount.value = report.hits || 0
  progress.value = report.percent
})

// Store uses 0-based page index, UI uses 1-based page index
syncRef(page, pageLocal, { transform: { ltr: (v) => v + 1, rtl: (v) => v - 1 } })

watchImmediate(activeSearch, () => {
  // Initial corpus selection may not have settled yet.
  if (corpusSelection.corpora.length) doSearch()
  else setTimeout(() => doSearch())
})

async function doSearch(isPaging = false) {
  // Empty search is possible when doing comparison first
  if (!activeSearch.value) return
  proxy.abort()
  progress.value = undefined
  // Remember options affecting result display in case they are changed while the request is ongoing
  const willBeReading = context.value || !store.in_order

  let response
  try {
    response = await proxy.makeRequest(activeSearch.value.cqp, isPaging)
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    throw error
  }

  // Use remembered state to control the result display
  isReading.value = willBeReading
  kwic.value = response.kwic
  distribution.value = response.distribution
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

function createExport() {
  const params = proxy.getParams()
  return transformData(exportType.value, kwic.value!, params, hitsCount.value)
}
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
        <ExportButton :disabled="!kwic" name="kwic" :get-rows="createExport">
          <div class="text-nowrap">
            <div v-for="option in ['kwic', 'annotations']" :key="option" class="form-check">
              <input
                type="radio"
                class="form-check-input"
                :id="`export-type-${option}`"
                :value="option"
                v-model="exportType"
              />
              <label :for="`export-type-${option}`" class="form-check-label">
                {{ $t(`result.kwic.export.type.${option}`) }}
              </label>
            </div>
          </div>
        </ExportButton>
      </template>
    </OptionsBar>

    <KwicResultsContent
      :distribution
      :hitsCount
      :hpp
      :isReading
      :kwic
      :loading="progress != undefined"
      v-model="pageLocal"
    />
  </div>
</template>
