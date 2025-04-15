<script lang="ts" setup>
import { shallowRef, type Component } from 'vue'
import WordWidget from './WordWidget.vue'

const standardComponents = {
  word: WordWidget,
}

// Use shallowRef to avoid deep reactivity
const components = shallowRef<Record<string, Component>>(standardComponents)

async function importExtendedComponents() {
  try {
    return (await import('@instance/components/search')).default
  } catch {}
}

importExtendedComponents().then((customComponents) => {
  components.value = { ...standardComponents, ...customComponents }
})
</script>

<template>
  <div>
    <div v-for="(component, name) in components" :key="name">
      <code>{{ name }}: </code>
      <component :is="component" />
    </div>
  </div>
</template>
