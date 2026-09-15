<script setup lang="ts">
import { computed, ref } from "vue"
import KwicGrid from "./KwicGrid.vue"
import { isKwic, type Row, type RowToken } from "@/core/kwic/kwic"
import HelpBadge from "@/components/HelpBadge.vue"
import PaginationBar from "./PaginationBar.vue"
import KwicList from "./KwicList.vue"
import { watchImmediate } from "@vueuse/core"
import type { HitsDistribution } from "@/core/backend/proxy/QueryProxyBase"
import HitsDistributionBar from "./HitsDistributionBar.vue"
import type { CorpusSet } from "@/core/corpora/CorpusSet"
import { formatDecimals } from "@/core/i18n"
import SidebarProvider from "../sidebar/SidebarProvider.vue"
import type { ResultState } from "../useResult"

/** Current page number, 1-indexed */
const page = defineModel<number>({ default: 1 })

const props = defineProps<{
  corpora?: CorpusSet
  distribution?: HitsDistribution[]
  hitsCount: number
  hpp: number
  isReading?: boolean
  kwic?: Row[]
  state?: ResultState
}>()

const selectedToken = ref<RowToken>()

const tokensTotal = computed(() => props.corpora?.getTokenCount())

const hitsRelative = computed(() =>
  tokensTotal.value ? (1e6 * props.hitsCount) / tokensTotal.value : 0,
)

/** Number of pages available */
const pageMax = computed(() => Math.ceil(props.hitsCount / props.hpp))

/** Go to previous page, unless at first page */
function decrementPage() {
  if (page.value > 1) page.value--
}

/** Go to next page, unless at last page */
function incrementPage() {
  if (page.value < pageMax.value) page.value++
}

watchImmediate(
  () => props.kwic,
  () => {
    // Select first match token
    const row = props.kwic?.find(isKwic)
    // Deselect if empty
    if (!row) {
      selectedToken.value = undefined
      return
    }
    const match = [row.match].flat()[0]!
    const token = row.tokens[match.start]!
    selectedToken.value = { row, token }
  },
)
</script>

<template>
  <SidebarProvider v-model="selectedToken" @keyup.p="decrementPage()" @keyup.n="incrementPage()">
    <div class="d-flex gap-4" :class="{ 'text-muted fst-italic': state == 'loading' }">
      <div>{{ $t("result.kwic.hits_count") }}: {{ $n(hitsCount) }}</div>
      <div>
        {{ $t("result.kwic.hits_relative") }}: {{ formatDecimals(hitsRelative, 1) }}
        <HelpBadge :text="$t('result.kwic.hits_relative.help')" />
      </div>
    </div>

    <div v-if="hitsCount" class="hstack gap-4">
      <PaginationBar v-if="pageMax > 1" v-model="page" :max="pageMax" class="flex-shrink-0" />
      <HitsDistributionBar
        v-if="distribution && distribution.length > 1 && hitsCount > hpp"
        :distribution
        :hpp
        v-model="page"
        class="flex-grow-1"
        style="min-width: 0"
      />
    </div>

    <template v-if="kwic">
      <KwicGrid v-if="!isReading" :data="kwic" @click="selectedToken = undefined" />
      <KwicList v-else :data="kwic" @click="selectedToken = undefined" />

      <PaginationBar v-if="pageMax > 1" v-model="page" :max="pageMax" />
    </template>
  </SidebarProvider>
</template>
