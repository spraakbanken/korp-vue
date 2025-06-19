<script lang="ts" setup>
import { inject, type Component } from 'vue'
import WordWidget from './WordWidget.vue'
import DefaultWidget from './DefaultWidget.vue'
import AutocExtendedWidget from './AutocExtendedWidget.vue'
import type { AttributeConfig } from '@/types/config.types'

// A few hard-coded standard components.
const standardComponents = {
  word: WordWidget,
  autocExtended: AutocExtendedWidget,
}

// Excerpt from what would come from backend corpus config.
const attrConfig: Record<string, AttributeConfig> = {
  blingbring: {},
  lex: {
    extended_component: {
      name: 'autocExtended',
      options: { error_on_empty: true },
    },
  },
  msd: {
    extended_component: 'msd',
  },
}

const instanceComponents = inject<Record<string, Component>>('korp.components.search', {})
const components: Record<string, Component> = { ...standardComponents, ...instanceComponents }
</script>

<template>
  Excerpt of real attribute config:
  <pre>{{ attrConfig }}</pre>
  Widgets to use:
  <div>
    <div v-for="(config, name) in attrConfig" :key="name">
      <code>{{ name }}: </code>
      <template v-if="'extended_component' in config && config.extended_component">
        <component
          v-if="typeof config.extended_component == 'string'"
          :is="components[config.extended_component]"
        />
        <component
          v-else
          :is="components[config.extended_component.name]"
          v-bind="config.extended_component.options"
        />
      </template>
      <DefaultWidget v-else />
    </div>
  </div>
</template>
