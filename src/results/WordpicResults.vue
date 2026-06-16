<script setup lang="ts">
import { watchImmediate } from "@vueuse/core"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "./useDynamicTabs"
import { debounce, isEqual } from "lodash-es"
import { RelationsProxy } from "@/core/backend/proxy/RelationsProxy"
import type { RelationsResponse, RelationsSort } from "@/core/backend/types/relations"
import {
  csvPrepend,
  type MatchedRelation,
  type WordPictureSection,
  type WordPictureSectionHeading,
} from "@/core/wordpic"
import HelpBadge from "@/components/HelpBadge.vue"
import { WordpicExampleTask } from "@/core/task/WordpicExampleTask"
import OptionsBar from "@/components/OptionsBar.vue"
import ExportButton from "./ExportButton.vue"
import { isAbortError } from "@/core/backend/proxy/ProxyBase"
import vFadeIfLoading from "@/components/vFadeIfLoading"
import HelpBox from "@/components/HelpBox.vue"
import useError from "@/components/useError"
import ErrorBox from "@/components/ErrorBox.vue"
import useSearchStore from "@/search/useSearchStore"
import { storeToRefs } from "pinia"
import { useMatomo } from "vue3-matomo"
import {
  RelationsTimeProxy,
  type PeriodWordPicture,
} from "@/core/backend/proxy/RelationsTimeProxy.ts"
import type { ProgressHandler } from "@/core/backend/types/index.ts"
import type { Corpus } from "@/core/config/corpusConfig.types.ts"
import WordpicCard from "./WordpicCard.vue"

type PeriodizationOption = { size: number; order: "asc" | "desc" }

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]
const UPDATE_DELAY_MS = 500
const RANGE_ALL = "all"

const progress = defineModel<number>("progress")

const { setError, clearError, errorMessage } = useError()
const { t } = useI18n()
const { createTab } = useDynamicTabs()
const { activeSearch } = storeToRefs(useSearchStore())
const matomo = useMatomo()

const cqp = computed(() => activeSearch.value?.cqp || "[]")
const data = ref<PeriodWordPicture[]>()
const limit = ref(LIMITS[0])
const periodSelected = ref<string>(RANGE_ALL)
const periodization = ref<PeriodizationOption>()
const periodizationLocal = ref<PeriodizationOption>()
const periodizationSupported = ref<Corpus[]>()
const periodizationUnsupported = ref<Corpus[]>()
const rawResponse = ref<RelationsResponse>()
const showPos = ref(false)
const sort = ref<RelationsSort>("mi")
const sortLocal = ref<RelationsSort>("mi")

const progressHandler: ProgressHandler = (report) => (progress.value = report.percent)
const proxy = new RelationsProxy().setProgressHandler(progressHandler)
const proxyTime = new RelationsTimeProxy().setProgressHandler(progressHandler)

const periodizationOptions = [1, 5, 10].flatMap((size) =>
  ["desc", "asc"].map((order) => ({ size, order })),
)

/** Options for the range selection when periodization is active */
const rangeOptions = computed(() => [
  RANGE_ALL,
  ...(data.value?.map((period) => period.range) || []),
])

onMounted(() => matomo.value?.trackEvent("Wordpic", "Activate"))

// Start watching the active search query
watchImmediate(activeSearch, () => doSearch())

async function doSearch() {
  proxy.abort()
  clearError()
  progress.value = 0

  try {
    const { type, word } = RelationsProxy.parseCqp(cqp.value)

    // Use different API endpoints depending on whether periodization is used
    if (periodizationLocal.value) {
      // Check which corpora will be ignored by this query
      ;[periodizationSupported.value, periodizationUnsupported.value] =
        RelationsTimeProxy.checkCorpusSupport()
      const { size, order } = periodizationLocal.value
      data.value = await proxyTime.makeRequest(type, word, sortLocal.value, size, order == "asc")
    } else {
      periodSelected.value = RANGE_ALL
      const result = await proxy.makeRequest(type, word, sortLocal.value)
      data.value = [{ range: RANGE_ALL, data: result }]
    }
    progress.value = 100
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    setError(error)
    data.value = undefined
    return
  }

  periodization.value = periodizationLocal.value
  rawResponse.value = proxy.getResponse()
  // Sort affects request as well as presentation. Use it for presentation only after response data is ready.
  sort.value = sortLocal.value
}

// Debounce repeated request to avoid lag when changing options quickly, e.g. by keyboard.
const onOptionsChange = debounce(() => {
  doSearch()
}, UPDATE_DELAY_MS)

function onClickRow(row: MatchedRelation): void {
  const task = new WordpicExampleTask(
    activeSearch.value!.corpora,
    row.source.join(),
    !!periodization.value,
  )
  createTab(t("result.kwic"), task)
  matomo.value?.trackEvent("Wordpic", "Subsearch")
}

/** Create data for CSV export */
function createExport() {
  // Assemble data from all periods
  const rows = []
  for (const period of data.value!) {
    const periodRows = period.data.generateCsv()
    if (periodization.value) csvPrepend(periodRows, "period", period.range)

    // Strip header except for the first set of rows
    if (rows.length) periodRows.shift()
    rows.push(...periodRows)
  }

  return rows
}

watch(periodizationLocal, () => {
  // Switch to the relative variants of sort options when using periodization, as they are more suitable for comparing
  if (periodizationLocal.value) {
    if (sortLocal.value == "freq") sortLocal.value = "freq_relative"
    if (sortLocal.value == "mi") sortLocal.value = "rmi"
  }
})

watch(sortLocal, () => matomo.value?.trackEvent("Wordpic", "Change sort", sortLocal.value))

watch(limit, () => matomo.value?.trackEvent("Wordpic", "Change limit", String(limit.value)))

watch(showPos, () =>
  matomo.value?.trackEvent("Wordpic", "Toggle show POS", showPos.value ? "on" : "off"),
)

/** Get the matching section the previous period */
function getPrevPeriodSection(
  range: string,
  heading: WordPictureSectionHeading,
): WordPictureSection | undefined {
  if (!data.value || !periodization.value) return
  const index = data.value.findIndex((period) => period.range == range)
  const prevIndex = periodization.value!.order == "asc" ? index - 1 : index + 1
  if (prevIndex < 0 || prevIndex >= data.value.length) return
  const prevData = data.value[prevIndex].data.getData()
  return prevData.find((section) => isEqual(section.heading, heading))
}
</script>

<template>
  <div class="vstack align-items-center gap-2">
    <!-- Options bar -->
    <OptionsBar>
      <!-- Periodization -->
      <label class="hstack gap-2">
        {{ $t("result.wordpic.periodization") }}:
        <select
          v-model="periodizationLocal"
          class="form-select form-select-sm w-auto"
          @change="onOptionsChange"
        >
          <option :value="undefined">{{ $t("result.wordpic.periodization.option.none") }}</option>
          <option
            v-for="{ size, order } in periodizationOptions"
            :key="`${size}-${order}`"
            :value="{ size, order }"
          >
            {{ $t(`result.wordpic.periodization.option.${order}`, size) }}
          </option>
        </select>
        <HelpBadge :text="$t('result.wordpic.periodization.help')" />
      </label>

      <!-- Sort/show (LMI etc) -->
      <label class="hstack gap-2">
        {{ $t("result.wordpic.sort") }}:
        <select
          class="form-select form-select-sm w-auto"
          v-model="sortLocal"
          @change="onOptionsChange"
        >
          <option value="freq">{{ $t("stat.freq") }}</option>
          <option value="freq_relative">{{ $t("stat.freq_relative") }}</option>
          <option value="mi">{{ $t("stat.mi") }}</option>
          <option value="rmi">{{ $t("stat.rmi") }}</option>
        </select>
        <HelpBadge
          v-if="['mi', 'rmi'].includes(sortLocal)"
          :text="$t('result.wordpic.sort.help')"
        />
      </label>

      <!-- Limit -->
      <label class="hstack gap-2">
        {{ $t("result.wordpic.limit") }}:
        <select class="form-select form-select-sm w-auto" v-model="limit">
          <option v-for="n in LIMITS" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

      <!-- Show POS -->
      <label class="form-check form-check-label">
        <input type="checkbox" v-model="showPos" class="form-check-input" />
        {{ $t("result.wordpic.show_pos") }}
      </label>

      <template #end>
        <ExportButton
          :disabled="!data"
          name="wordpic"
          :get-rows="createExport"
          :json="rawResponse"
          endpoint="relations"
        />
      </template>
    </OptionsBar>

    <!-- Period selector button bar -->
    <div v-if="data && periodization" class="hstack flex-wrap gap-2 align-items-baseline">
      <span>{{ $t("result.wordpic.period.select") }}:</span>
      <!-- TODO Focus prev/next on left/right key (as a generic directive for btn-groups?) -->
      <div class="btn-group flex-wrap row-gap-1">
        <button
          v-for="range in rangeOptions"
          :key="range"
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: periodSelected == range }"
          @click="periodSelected = range"
        >
          {{ range == RANGE_ALL ? $t("result.wordpic.period.all") : range.replace("-", "–") }}
        </button>
      </div>
    </div>

    <div v-if="data" v-fade-if-loading="progress" class="vstack gap-4">
      <!-- Single wordpic if no periodization, otherwise either all periods or the selected period -->
      <template v-for="period in data" :key="period.range">
        <div v-if="periodSelected == RANGE_ALL || periodSelected == period.range">
          <h3 v-if="period.range != RANGE_ALL" class="text-center">
            {{ period.range.replace("-", "–") }}
          </h3>

          <!-- Cards with headings like "dog (noun)"; same word can have multiple POS -->
          <div class="d-flex flex-wrap justify-content-center gap-2">
            <WordpicCard
              v-for="section of period.data.getData()"
              :key="`${section.heading.word} ${section.heading.pos}`"
              :section
              :prevSection="getPrevPeriodSection(period.range, section.heading)"
              :limit
              :sort
              :showPos
              class="card p-2 bg-body-tertiary"
              @click-row="onClickRow"
            />
          </div>
        </div>
      </template>

      <div class="alert alert-warning" v-if="!data.length">
        {{ $t("result.wordpic.empty") }}
      </div>
    </div>

    <ErrorBox v-if="errorMessage" v-bind="errorMessage" class="mx-auto mb-0" />

    <HelpBox>
      <p>{{ $t("result.wordpic.description") }}</p>
      <p class="mb-0">{{ $t("result.wordpic.description.result") }}</p>
    </HelpBox>
  </div>
</template>
