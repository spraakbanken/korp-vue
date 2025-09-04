<script setup lang="ts">
import { ref } from 'vue'
import HeaderSection from '@/HeaderSection.vue'
import MainSection from '@/MainSection.vue'
import SearchSection from '@/SearchSection.vue'
import { loadSettings } from '@/core/config'

const initDone = ref(false)

;(async () => {
  await loadSettings()
  initDone.value = true
})()
</script>

<template>
  <div v-if="!initDone">Loading...</div>
  <HeaderSection v-if="initDone" />
  <SearchSection v-if="initDone" />
  <MainSection v-if="initDone" />
</template>
