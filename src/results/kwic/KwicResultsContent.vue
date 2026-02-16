<script setup lang="ts">
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { computed, provide, ref } from "vue"
import KwicGrid from "./KwicGrid.vue"
import { isKwic, type Row, type SelectedToken } from "@/core/kwic/kwic"
import HelpBadge from "@/components/HelpBadge.vue"
import PaginationBar from "../PaginationBar.vue"
import KwicSidebar, { SIDEBAR_WIDTH_REM } from "../sidebar/KwicSidebar.vue"
import { injectionKeys } from "@/injection"
import KwicList from "./KwicList.vue"
import { watchImmediate } from "@vueuse/core"

const page = defineModel<number>({ default: 1 })

const props = defineProps<{
  hitsCount: number
  hpp: number
  isReading?: boolean
  kwic?: Row[]
  loading?: boolean
}>()

const corpusSelection = useReactiveCorpusSelection()

const tokensTotal = computed(() => corpusSelection.getTokenCount())
const hitsRelative = computed(() => (tokensTotal.value ? props.hitsCount / tokensTotal.value : 0))
const selectedToken = ref<SelectedToken>()

provide(injectionKeys.selectedToken, selectedToken)

watchImmediate(
  () => props.kwic,
  () => {
    // Select first match token
    const row = props.kwic?.find(isKwic)
    if (!row) return
    const match = [row.match].flat()[0]!
    const token = row.tokens[match.start]!
    selectedToken!.value = { row, token }
  },
)
</script>

<template>
  <div
    class="position-relative vstack gap-2"
    @click="selectedToken = undefined"
    :style="{
      // Make sure sidebar isn't too short if KWIC page is short
      minHeight: '50rem',
      // Make room for sidebar
      paddingRight: selectedToken ? `${SIDEBAR_WIDTH_REM + 0.5}rem` : undefined,
    }"
  >
    <div class="d-flex gap-4" :class="{ 'text-muted fst-italic': loading }">
      <div>
        {{ $t("result.kwic.hits_count", [$n(hitsCount)]) }}
      </div>
      <div>
        {{ $t("result.kwic.hits_relative", [$n(hitsRelative)]) }}
        <HelpBadge :text="$t('result.kwic.hits_relative.help')" />
      </div>
    </div>

    <template v-if="kwic">
      <PaginationBar v-if="hitsCount > hpp" v-model="page" :max="Math.ceil(hitsCount / hpp)" />

      <KwicGrid v-if="!isReading" :data="kwic" />
      <KwicList v-else :data="kwic" />

      <PaginationBar v-if="hitsCount > hpp" v-model="page" :max="Math.ceil(hitsCount / hpp)" />
    </template>

    <KwicSidebar @click.stop />
  </div>
</template>
