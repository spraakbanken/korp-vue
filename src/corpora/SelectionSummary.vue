<script setup lang="ts">
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
    <div>
      {{ $t("corpus.selection.summary.selected", store.corpus.length) }}
      {{
        $t("corpus.selection.summary.tokens", corpusSelection.getTokenCount(), {
          list: [$n(corpusSelection.getTokenCount(), { notation: "compact" })],
        })
      }}
    </div>
    <div class="text-muted">
      {{ $t("corpus.selection.summary.total", totalCorpora) }}
      {{
        $t("corpus.selection.summary.tokens", totalTokens, {
          list: [$n(totalTokens, { notation: "compact" })],
        })
      }}
    </div>
  </div>
</template>
