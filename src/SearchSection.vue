<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import settings from './core/config'
import { locObj } from './i18n'

const { locale } = useI18n()
</script>

<template>
  <section>
    Corpora:
    <span v-for="corpus of settings.corpora" :key="corpus.id">
      {{ locObj(corpus.title, locale) }}
      &nbsp;
    </span>
  </section>
</template>
