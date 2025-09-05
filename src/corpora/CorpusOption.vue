<script setup lang="ts">
import type { Corpus } from '@/core/config/corpusConfig.types'
import { locObj } from '@/i18n'
import { useI18n } from 'vue-i18n'

defineProps<{
  corpus: Corpus
  selected: boolean
}>()

defineEmits<{
  (e: 'change', corpusId: string): void
}>()

const { locale } = useI18n()
</script>

<template>
  <label>
    <input type="checkbox" :checked="selected" @change="$emit('change', corpus.id)" />
    {{ locObj(corpus.title, locale) }}
  </label>
</template>
