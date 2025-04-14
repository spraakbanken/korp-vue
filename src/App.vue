<script setup lang="ts">
import settings from '@/settings'
import ExtendedSearchCondition from './components/ExtendedSearch/ExtendedSearchCondition.vue'
import { ref } from 'vue'

// This will come from url
const mode = 'default'
const isModeLoaded = ref(false)

/** Loads mode code for side effects, if present */
async function loadModeModule() {
  try {
    await import(`@config/modes/${mode}_mode.js`)
  } catch (error: unknown) {
    console.error(error)
  }
  isModeLoaded.value = true
}

loadModeModule()
</script>

<template>
  <header>
    <h2>Config dir config.yml</h2>
    <div v-html="settings.description.eng"></div>

    <h2>Side effects from mode code</h2>
    <div v-if="isModeLoaded">
      {{ settings.frontpage.examples[0] }}
    </div>

    <h2>Custom component</h2>
    <ExtendedSearchCondition />
  </header>
</template>
