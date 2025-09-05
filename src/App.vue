<script setup lang="ts">
import { ref } from 'vue'
import HeaderSection from '@/HeaderSection.vue'
import MainSection from '@/MainSection.vue'
import SearchSection from '@/SearchSection.vue'
import { loadSettings } from '@/core/config/init'
import { useExpose } from '@/useExpose'

useExpose()

const initDone = ref(false)

;(async () => {
  await loadSettings()

  initDone.value = true
})()
</script>

<template>
  <template v-if="initDone">
    <HeaderSection />
    <SearchSection />
    <MainSection />
  </template>
  <div v-else>Loading...</div>
</template>
