<script lang="ts" setup>
import { shallowRef, type Component } from 'vue'
import WordWidget from './WordWidget.vue'

const standardComponents = {
  word: WordWidget,
}

// Use shallowRef to avoid deep reactivity
const components = shallowRef<Record<string, Component>>()

async function importExtendedComponents() {
  try {
    // @ts-expect-error TS is not aware of dynamic imports
    return (await import('@config/components/extended')).default
  } catch (error) {
    console.error(error)
  }
}

importExtendedComponents().then((customComponents) => {
  components.value = { ...standardComponents, ...customComponents }
})
</script>

<template>
  <div>
    <div v-for="(component, name) in components" :key="name">
      <h3>{{ name }}</h3>
      <component :is="component" />
    </div>
  </div>
</template>
