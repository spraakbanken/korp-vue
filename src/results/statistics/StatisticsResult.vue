<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { getCqp, processStatisticsResult } from "@/core/statistics/statistics"
import { isTotalRow, type Row, type StatisticsProcessed } from "@/core/statistics/statistics.types"
import { ExampleTask } from "@/core/task/ExampleTask"
import { useAppStore } from "@/store/useAppStore"
import { watchDeep, watchImmediate, whenever } from "@vueuse/core"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "../useDynamicTabs"
import StatisticsGrid from "./StatisticsGrid.vue"
import { compact, debounce } from "lodash"
import StatisticsAttributeSelector, {
  type StatisticsAttributeSelectorModel,
} from "./StatisticsAttributeSelector.vue"
import { storeToRefs } from "pinia"
import HelpBadge from "@/components/HelpBadge.vue"
import { TrendTask } from "@/core/task/TrendTask"
import type { CorpusSet } from "@/core/corpora/CorpusSet"

const UPDATE_DELAY_MS = 500

const props = defineProps<{
  active: boolean
}>()

const store = useAppStore()
const { t } = useI18n()
const { createTab } = useDynamicTabs()

const attributesSelected = ref<StatisticsAttributeSelectorModel>({
  selected: store.stats_reduce.split(","),
  insensitive: store.stats_reduce_insensitive.split(","),
})
let corpusSelectionSearched: CorpusSet | null = null
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<StatisticsProcessed>()
const rowsSelected = ref<Row[]>([])
let withinSearched: string | null = null
const { activeSearch, statsRelative } = storeToRefs(store)

const proxy = new StatsProxy()

// Enable statistics when opening tab first time
whenever(
  () => props.active,
  () => {
    // Start watching search query
    watchImmediate(activeSearch, () => {
      // Initial corpus selection may not have settled yet.
      if (corpusSelection.corpora.length) doSearch()
      else setTimeout(() => doSearch())
    })
  },
  { once: true, immediate: true },
)

async function doSearch() {
  // Empty search is possible when doing comparison first
  if (!store.activeSearch) return
  corpusSelectionSearched = corpusSelection.pick(corpusSelection.getIds())
  withinSearched = store.within
  const attrs = attributesSelected.value
  const cqpValue = cqp.value
  const ignoreCase = !!attrs.insensitive.length
  const counts = await proxy.makeRequest(cqpValue, attrs.selected, withinSearched, ignoreCase)
  data.value = await processStatisticsResult(
    corpusSelectionSearched.stringify(false),
    counts,
    attrs.selected,
    ignoreCase,
    cqpValue,
  )
}

const onOptionsChange = debounce(() => {
  const { selected, insensitive } = attributesSelected.value
  store.stats_reduce = selected.join()
  store.stats_reduce_insensitive = insensitive.join()
  doSearch()
}, UPDATE_DELAY_MS)

watchDeep(attributesSelected, onOptionsChange)

/** Open a dynamic subsearch tab when clicking a frequency value */
function onClickValue(corpusIds: string[], subcqp?: string) {
  // Reuse the main query and add a subquery for the selected row (unless it's the totals row)
  const cqps = [cqp.value]
  if (subcqp) cqps.push(subcqp)

  const within = proxy.getParams().default_within
  const task = new ExampleTask(corpusIds, cqps, within)
  createTab(t("result.kwic"), task)
}

function openTrendTab() {
  const ignoreCase = !!attributesSelected.value.insensitive.length
  let showTotal = false
  const subqueries: [string, string][] = []
  for (const row of rowsSelected.value) {
    if (isTotalRow(row)) {
      showTotal = true
      continue
    }
    const cqp = getCqp(row.statsValues, ignoreCase)
    const label = attributesSelected.value.selected
      .map((attr) => row.formattedValue[attr])
      .join(", ")
    subqueries.push([cqp, label])
  }

  const task = new TrendTask(
    cqp.value,
    subqueries,
    showTotal,
    corpusSelectionSearched!,
    withinSearched!,
  )
  createTab(t("result.trend"), task)
}
</script>

<template>
  <div class="vstack gap-2">
    <div class="bg-secondary-subtle p-2 d-flex gap-4 align-items-baseline">
      <label class="d-flex align-items-baseline gap-1">
        {{ $t("result.statistics.group_by") }}:
        <StatisticsAttributeSelector v-model="attributesSelected" />
      </label>

      <label class="form-check-label">
        <input class="form-check-input" type="checkbox" v-model="statsRelative" />
        {{ $t("result.statistics.relative") }}
        <HelpBadge :text="$t('result.statistics.relative.help')" />
      </label>
    </div>

    <div class="hstack gap-2 align-items-baseline">
      <button type="button" class="btn btn-secondary" :disabled="!data" @click="openTrendTab()">
        {{ $t("result.statistics.trend") }}
      </button>
    </div>

    <StatisticsGrid
      v-if="data"
      :attributes="attributesSelected.selected"
      :rows="data.rows"
      :params="data.params"
      v-model="rowsSelected"
      @click-value="onClickValue($event.corpusIds, $event.cqp)"
    />
  </div>
</template>
