<script setup lang="ts">
import { StatsProxy } from "@/core/backend/proxy/StatsProxy"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { processStatisticsResult } from "@/core/statistics/statistics"
import { isTotalRow, type StatisticsProcessed } from "@/core/statistics/statistics.types"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { whenever } from "@vueuse/core"
import { computed, ref } from "vue"

const props = defineProps<{
  active: boolean
}>()

const store = useAppStore()
const { locObj } = useLocale()

const attrs = ref<string[]>(["word"])
const corpora = ref<Corpus[]>(corpusSelection.corpora)
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<StatisticsProcessed>()

const proxy = new StatsProxy()

// Enable statistics when opening tab first time
whenever(
  () => props.active,
  () => {
    // Initial corpus selection may not have settled yet.
    if (corpusSelection.corpora.length) doSearch()
    else setTimeout(() => doSearch())
  },
  { once: true, immediate: true },
)

async function doSearch() {
  const attrsValue = attrs.value
  corpora.value = corpusSelection.corpora
  const cqpValue = cqp.value
  const originalCorpora = corpusSelection.stringify(false)
  const counts = await proxy.makeRequest(cqpValue, attrsValue)
  data.value = await processStatisticsResult(originalCorpora, counts, attrsValue, false, cqpValue)
}
</script>

<template>
  <div>
    <div v-if="data">
      <table>
        <thead>
          <tr>
            <th :colspan="attrs.length">Value</th>
            <th>Total</th>
            <th v-for="corpus in corpora" :key="corpus.id">{{ locObj(corpus.title) }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in data.rows" :key="row.rowId">
            <!-- The totals row -->
            <template v-if="isTotalRow(row)">
              <td :colspan="attrs.length">Σ</td>
              <td class="text-end">{{ row.total[0] }}</td>
              <td v-for="corpus in corpora" :key="corpus.id" class="text-end">
                {{ row.count[corpus.id.toUpperCase()]![0] }}
              </td>
            </template>

            <!-- Each value row -->
            <template v-else>
              <td v-for="(value, i) in row.formattedValue" :key="i">{{ value }}</td>
              <td class="text-end">{{ row.total[0] }}</td>
              <td v-for="corpus in corpora" :key="corpus.id" class="text-end">
                {{ row.count[corpus.id.toUpperCase()]![0] }}
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
