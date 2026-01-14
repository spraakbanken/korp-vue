<script setup lang="ts">
import type { ApiKwic } from "@/core/backend/types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { computed, provide, ref } from "vue"
import KwicGrid from "./KwicGrid.vue"
import { massageData, type SelectedToken } from "@/core/kwic/kwic"
import HelpBadge from "@/components/HelpBadge.vue"
import PaginationBar from "../PaginationBar.vue"
import KwicSidebar from "../sidebar/KwicSidebar.vue"
import { injectionKeys } from "@/injection"
import KwicReader from "./KwicReader.vue"

const page = defineModel<number>({ default: 1 })

const props = defineProps<{
  hasContext?: boolean
  hitsCount: number
  hpp: number
  kwic?: ApiKwic[]
  loading?: boolean
}>()

const tokensTotal = ref(corpusSelection.getTokenCount())
const hitsRelative = computed(() => (tokensTotal.value ? props.hitsCount / tokensTotal.value : 0))
const selectedToken = ref<SelectedToken>()

provide(injectionKeys.selectedToken, selectedToken)

corpusSelection.listen(() => {
  tokensTotal.value = corpusSelection.getTokenCount()
})
</script>

<template>
  <div>
    <div class="my-2 d-flex flex-wrap justify-content-between align-items-baseline">
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
      <KwicGrid v-if="!hasContext && kwic" :data="massageData(kwic)" />
      <KwicReader v-if="hasContext && kwic" :data="massageData(kwic)" />

      <KwicSidebar @click.stop />
    </div>
  </div>
</template>
