<script lang="ts" setup>
import { shallowRef, type Component } from 'vue'
import Word from './Word.vue'

const standardComponents = {
  word: Word,
}

// Use shallowRef to avoid deep reactivity
const components = shallowRef<Record<string, Component>>()

async function importExtendedComponents() {
  try {
    // @ts-expect-error TS does not know about the "config/" alias.
    return (await import('config/components/extended')).default
  } catch (error) {
    console.error(error)
    return {}
  }
}

importExtendedComponents().then((customComponents) => {
  components.value = { ...standardComponents, ...customComponents }
})
</script>

<template>
  <div>
    <h2>Extended Search Condition</h2>
    <div v-for="(component, name) in components" :key="name">
      <h3>{{ name }}</h3>
      <component :is="component" />
    </div>
  </div>
</template>
