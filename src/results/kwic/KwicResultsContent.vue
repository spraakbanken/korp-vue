<script setup lang="ts">
import type { ApiKwic } from "@/core/backend/types"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { computed, provide, ref } from "vue"
import KwicGrid from "./KwicGrid.vue"
import { massageData, type SelectedToken } from "@/core/kwic/kwic"
import HelpBadge from "@/components/HelpBadge.vue"
import PaginationBar from "../PaginationBar.vue"
import KwicSidebar from "../sidebar/KwicSidebar.vue"
import { injectionKeys } from "@/injection"
import KwicList from "./KwicList.vue"

const page = defineModel<number>({ default: 1 })

const props = defineProps<{
  hitsCount: number
  hpp: number
  isReading?: boolean
  kwic?: ApiKwic[]
  loading?: boolean
}>()

const corpusSelection = useReactiveCorpusSelection()

const tokensTotal = computed(() => corpusSelection.getTokenCount())
const hitsRelative = computed(() => (tokensTotal.value ? props.hitsCount / tokensTotal.value : 0))
const rows = computed(() => (props.kwic ? massageData(props.kwic) : undefined))
const selectedToken = ref<SelectedToken>()

provide(injectionKeys.selectedToken, selectedToken)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between align-items-baseline">
      <div class="d-flex gap-4" :class="{ 'text-muted fst-italic': loading }">
        <div>
          {{ $t("result.kwic.hits_count", [$n(hitsCount)]) }}
        </div>
        <div>
          {{ $t("result.kwic.hits_relative", [$n(hitsRelative)]) }}
          <HelpBadge :text="$t('result.kwic.hits_relative.help')" />
        </div>
      </div>

      <PaginationBar v-if="hitsCount > hpp" v-model="page" :max="Math.ceil(hitsCount / hpp)" />
    </div>

    <div class="d-flex gap-2 align-items-start" @click="selectedToken = undefined">
      <template v-if="rows">
        <KwicGrid v-if="!isReading" :data="rows" />
        <KwicList v-else :data="rows" />
      </template>

      <KwicSidebar @click.stop />
    </div>
  </div>
</template>
