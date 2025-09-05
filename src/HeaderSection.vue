<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import settings from '@/core/config'
import { locObj } from '@/i18n'

const { locale } = useI18n()
</script>

<template>
  <header>
    <div>
      Modes:
      <span v-for="{ label, mode } of settings.modes" :key="mode">
        <a :href="`?mode=${mode}`">{{ locObj(label, locale) }}</a>
        &nbsp;
      </span>
    </div>
  </header>
</template>
