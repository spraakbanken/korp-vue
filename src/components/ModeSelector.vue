<script setup lang="ts">
import type { Mode } from '@/backend/types/corpus-config'
import { useInit } from '@/useInit'
import { th } from '@/util'
import { Select } from 'primevue'
import { inject } from 'vue'

const { settings } = useInit()

const mode = inject('mode')

function changeMode(value: Mode) {
  const modeNew = value.mode
  location.href = `?mode=${modeNew}`
}
</script>

<template>
  <label>
    Mode:
    <Select
      :loading="!settings"
      :options="settings?.modes || []"
      :modelValue="settings?.modes.find((item) => item.mode == mode) || {}"
      @change="changeMode($event.value)"
    >
      <template #value="{ value }">{{ value ? th(value.label) : mode }}</template>
      <template #option="slotProps">{{ th(slotProps.option.label) }}</template>
    </Select>
  </label>
</template>
