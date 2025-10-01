<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watchImmediate } from '@vueuse/core'
import { corpusListing, corpusSelection } from '@/core/corpora/corpusListing'
import { useAppStore } from '@/store/useAppStore'
import { locObj } from '@/i18n'

const store = useAppStore()
const { locale } = useI18n()

// Keep global corpusSelection in sync with selected ids.
watchImmediate(
  () => store.corpus,
  () => corpusSelection.pickFrom(corpusListing, store.corpus),
)
</script>

<template>
  {{ $t('corpora') }}:
  <select multiple v-model="store.corpus" size="8">
    <option v-for="corpus of corpusListing.corpora" :key="corpus.id" :value="corpus.id">
      {{ locObj(corpus.title, locale) }}
    </option>
  </select>
</template>
