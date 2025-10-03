<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watchImmediate } from '@vueuse/core'
import { corpusListing, corpusSelection } from '@/core/corpora/corpusListing'
import { useAppStore } from '@/store/useAppStore'
import { locObj } from '@/i18n'
import CorpusSelectionDialog from './CorpusSelectionDialog.vue'

const store = useAppStore()
const { locale } = useI18n()

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
      {{ locObj(corpus.title, locale) }}
    </option>
  </select>

  <div>corpusSelection: {{ corpusSelection.corpora.map((c) => locObj(c.title)) }}</div>
</template>
