<script setup lang="ts">
import { watchImmediate } from "@vueuse/core"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "./useDynamicTabs"
import { debounce } from "lodash-es"
import { RelationsProxy } from "@/core/backend/proxy/RelationsProxy"
import type { RelationsResponse, RelationsSort } from "@/core/backend/types/relations"
import { formatWordOrLemgram, type MatchedRelation } from "@/core/wordpic"
import WordpicRow from "./WordpicRow.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import { WordpicExampleTask } from "@/core/task/WordpicExampleTask"
import OptionsBar from "@/components/OptionsBar.vue"
import ExportButton from "./ExportButton.vue"
import vFadeIfLoading from "@/components/vFadeIfLoading"
import HelpBox from "@/components/HelpBox.vue"
import useSearchStore from "@/search/useSearchStore"
import { storeToRefs } from "pinia"
import { useMatomo } from "vue3-matomo"
import { useResult } from "./useResult"
import ResultsDisplay from "./ResultsDisplay.vue"

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]
const UPDATE_DELAY_MS = 500

const progress = defineModel<number>("progress")

const { t } = useI18n()
const { createTab } = useDynamicTabs()
const { activeSearch } = storeToRefs(useSearchStore())
const matomo = useMatomo()

const cqp = computed(() => activeSearch.value?.cqp || "[]")
const limit = ref(LIMITS[0])
const rawResponse = ref<RelationsResponse>()
const showPos = ref(false)
const sort = ref<RelationsSort>("mi")
const sortLocal = ref<RelationsSort>("mi")

const proxy = new RelationsProxy().setProgressHandler((report) => {
  progress.value = report.percent
})

onMounted(() => matomo.value?.trackEvent("Wordpic", "Activate"))

async function load() {
  const query = RelationsProxy.parseCqp(cqp.value)
  const result = await proxy.makeRequest(query.type, query.word, sortLocal.value)

  rawResponse.value = proxy.getResponse()
  // Sort affects request as well as presentation. Use it for presentation only after response data is ready.
  sort.value = sortLocal.value

  return result
}

const { data, state, errorMessage, loadResult } = useResult(progress, load, proxy)

// Start watching the active search query
watchImmediate(activeSearch, () => loadResult())

// Debounce repeated request to avoid lag when changing options quickly, e.g. by keyboard.
const onOptionsChange = debounce(() => {
  loadResult(true)
}, UPDATE_DELAY_MS)

function onClickRow(row: MatchedRelation): void {
  const task = new WordpicExampleTask(activeSearch.value!.corpora, row.source.join())
  createTab(() => t("result.kwic"), task)
  matomo.value?.trackEvent("Wordpic", "Subsearch")
}

function createExport() {
  return data.value!.generateCsv()
}

watch(sortLocal, () => matomo.value?.trackEvent("Wordpic", "Change sort", sortLocal.value))

watch(limit, () => matomo.value?.trackEvent("Wordpic", "Change limit", String(limit.value)))

watch(showPos, () =>
  matomo.value?.trackEvent("Wordpic", "Toggle show POS", showPos.value ? "on" : "off"),
)
</script>

<template>
  <div class="vstack align-items-center gap-2">
    <!-- Options bar -->
    <OptionsBar>
      <label class="d-flex gap-2 align-items-baseline">
        {{ $t("result.wordpic.sort") }}:
        <select
          class="form-select form-select-sm w-auto"
          v-model="sortLocal"
          @change="onOptionsChange"
        >
          <option value="freq">{{ $t("stat.freq") }}</option>
          <option value="mi">{{ $t("stat.mi") }}</option>
        </select>
        <HelpBadge :text="$t('result.wordpic.sort.help')" />
      </label>

      <label class="d-flex gap-2 align-items-baseline">
        {{ $t("result.wordpic.limit") }}:
        <select class="form-select form-select-sm w-auto" v-model="limit">
          <option v-for="n in LIMITS" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

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

    <!-- Wordpic cards -->
    <ResultsDisplay
      :errorMessage
      :state
      :populated="!!data?.getData().length"
      class="d-flex flex-wrap justify-content-center gap-2"
      v-fade-if-loading="progress"
    >
      <!-- Cards with headings like "dog (noun)"; same word can have multiple POS -->
      <div
        v-for="section of data?.getData()"
        :key="`${section.heading.word} ${section.heading.pos}`"
        class="card p-2 bg-body-tertiary"
      >
        <h4
          class="mb-3d"
          v-html="formatWordOrLemgram(section.heading.word, section.heading.pos, $t, true)"
        />

        <div class="d-flex flex-wrap gap-5">
          <div v-for="table in section.tables" :key="table.index">
            <!-- A table header with relation names -->
            <div class="hstack mb-2 justify-content-center">
              <div
                v-for="(column, i) in table.columnsBefore"
                :key="i"
                class="p-2 text-dark"
                :style="{ backgroundColor: column.config.color }"
              >
                {{ $t(column.config.alt_label || `rel.${column.config.rel.toLowerCase()}`) }}
              </div>
              <div
                class="p-2 fw-bold"
                v-html="formatWordOrLemgram(section.heading.word, section.heading.pos, $t)"
              />
              <div
                v-for="(column, i) in table.columnsAfter"
                :key="i"
                class="p-2 text-dark"
                :style="{ backgroundColor: column.config.color }"
              >
                {{ $t(column.config.alt_label || `rel.${column.config.rel.toLowerCase()}`) }}
              </div>
            </div>

            <!-- A column for each relation -->
            <div class="d-flex align-items-start">
              <div
                v-for="(column, i) in table.columns"
                :key="i"
                class="text-dark"
                :style="{ backgroundColor: column.config.color }"
              >
                <table class="m-1">
                  <WordpicRow
                    v-for="(row, j) in column.rows.slice(0, limit)"
                    :key="j"
                    :row="row"
                    :sort="sort"
                    :showPos
                    @clickRow="onClickRow"
                  />
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResultsDisplay>

    <HelpBox>
      <p>{{ $t("result.wordpic.description") }}</p>
      <p class="mb-0">{{ $t("result.wordpic.description.result") }}</p>
    </HelpBox>
  </div>
</template>
