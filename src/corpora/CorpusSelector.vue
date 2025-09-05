<script setup lang="ts">
import settings from '@/core/config'
import { useAppStore } from '@/store/useAppStore'
import CorpusOption from './CorpusOption.vue'

const store = useAppStore()

function toggleCorpus(corpusId: string) {
  if (store.corpus.includes(corpusId)) store.corpus = store.corpus.filter((id) => id != corpusId)
  else store.corpus = [...store.corpus, corpusId]
}
</script>

<template>
  {{ $t('corpora') }}:
  <CorpusOption
    v-for="corpus of settings.corpora"
    :key="corpus.id"
    :corpus
    :selected="store.corpus.includes(corpus.id)"
    @change="toggleCorpus(corpus.id)"
  />
</template>
