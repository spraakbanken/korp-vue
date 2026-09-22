<script setup lang="ts">
import { useReactiveCorpusSelection } from "./useReactiveCorpusSelection"
import { useAppStore } from "@/store/useAppStore"
import { useLocale } from "@/i18n/useLocale"

defineProps<{
  totalCorpora: number
  totalTokens: number
}>()

const corpusSelection = useReactiveCorpusSelection()
const store = useAppStore()
const { formatLargeNumber } = useLocale()
</script>

<template>
  <div>
    <div :class="{ 'text-danger': !store.corpus.length }">
      {{
        $t("corpus.selection.summary", totalCorpora, {
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
            selected: formatLargeNumber(corpusSelection.getTokenCount()),
            total: formatLargeNumber(totalTokens),
          },
        })
      }}
    </div>
  </div>
</template>
