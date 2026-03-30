<script setup lang="ts">
import { abbreviateNumber } from "@/core/i18n"
import { useReactiveCorpusSelection } from "./useReactiveCorpusSelection"
import { useAppStore } from "@/store/useAppStore"

defineProps<{
  totalCorpora: number
  totalTokens: number
}>()

const corpusSelection = useReactiveCorpusSelection()
const store = useAppStore()
</script>

<template>
  <div>
    <div :class="{ 'text-danger': !store.corpus.length }">
      {{
        $t("corpus.selection.summary", store.corpus.length, {
          named: {
            selected: $n(store.corpus.length),
            total: $n(totalCorpora),
          },
        })
      }}
    </div>
    <div class="text-muted">
      {{
        $t("corpus.selection.summary.tokens", corpusSelection.getTokenCount(), {
          named: {
            selected: abbreviateNumber(corpusSelection.getTokenCount()),
            total: abbreviateNumber(totalTokens),
          },
        })
      }}
    </div>
  </div>
</template>
