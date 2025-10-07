<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import settings from '@/core/config'
import { locObj } from '@/i18n'
import { useAppStore } from './store/useAppStore'
import { storeToRefs } from 'pinia'
import { useAuth } from './auth/useAuth'

const { locale } = useI18n()
const store = useAppStore()
const auth = useAuth()

const { lang } = storeToRefs(store)
</script>

<template>
  <header>
    <div>
      {{ $t('modes') }}:
      <span v-for="{ label, mode } of settings.modes" :key="mode">
        <a :href="`?mode=${mode}`">{{ locObj(label, locale) }}</a>
        &nbsp;
      </span>
    </div>

    <div>
      {{ $t('language') }}:
      <label v-for="l in settings.languages" :key="l.value">
        <input type="radio" v-model="lang" :value="l.value" />
        {{ locObj(l.label, lang) }}
      </label>
    </div>

    <div>
      <component :is="auth?.statusComponent" />
    </div>
  </header>
</template>
