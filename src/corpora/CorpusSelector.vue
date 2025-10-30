<script setup lang="ts">
import { watchImmediate } from '@vueuse/core'
import { corpusListing, corpusSelection } from '@/core/corpora/corpusListing'
import { useAppStore } from '@/store/useAppStore'
import CorpusSelectionDialog from './CorpusSelectionDialog.vue'
import { useLocale } from '@/i18n/useLocale'

const store = useAppStore()
const { locObj } = useLocale()

/** Runs after corpus selection has been checked for access etc. */
function resolveValidation(ids: string[]) {
  store.corpus = ids

  // Keep global corpusSelection in sync with selected ids.
  watchImmediate(
    () => store.corpus,
    () => corpusSelection.pickFrom(corpusListing, store.corpus),
  )
}
</script>

<template>
  <CorpusSelectionDialog @resolve="resolveValidation" />

  {{ $t('corpora') }}:
  <select multiple v-model="store.corpus" size="8">
    <option v-for="corpus of corpusListing.corpora" :key="corpus.id" :value="corpus.id">
      {{ locObj(corpus.title) }}
    </option>
  </select>

  <!-- TODO corpusSelection is not reactive -->
  <div>corpusSelection: {{ corpusSelection.corpora.map((c) => locObj(c.title)) }}</div>
</template>
