<script lang="ts" setup>
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { injectionKeys } from "@/injection"
import { computed, inject, useId, type Component } from "vue"
import WordWidget from "./WordWidget.vue"

const model = defineModel<string>({ required: true })

const props = defineProps<{
  attribute?: Attribute
}>()

const inputId = useId()

const widgets: Record<string, Component> = {
  word: WordWidget,
  ...inject(injectionKeys.search.widgets),
}

const widget = computed(() => (props.attribute ? widgets[props.attribute.name] : undefined))
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.value") }}</label>
    <component v-if="widget" :is="widget" :id="inputId" v-model="model" />
    <!-- Fall back to standard text input -->
    <input v-else type="text" :id="inputId" v-model="model" size="10" class="form-control" />
  </div>
</template>
