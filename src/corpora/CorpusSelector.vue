<script setup lang="ts">
import settings from '@/core/config'
import { useAppStore } from '@/store/useAppStore'
import { locObj } from '@/i18n'
import { useI18n } from 'vue-i18n'

const store = useAppStore()
const { locale } = useI18n()
</script>

<template>
  {{ $t('corpora') }}:
  <select multiple v-model="store.corpus" size="8">
    <option v-for="corpus of settings.corpora" :key="corpus.id" :value="corpus.id">
      {{ locObj(corpus.title, locale) }}
    </option>
  </select>
</template>
