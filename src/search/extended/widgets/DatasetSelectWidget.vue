<script setup lang="ts">
import { getDatasetOptions } from "@/core/corpora/attribute"
import type { WidgetProps } from "./widget"

const model = defineModel<string>({ required: true })

defineProps<WidgetProps>()
</script>

<template>
  <select class="form-select" v-model="model">
    <option v-for="[value, label] in getDatasetOptions(attribute)" :key="value" :value>
      {{ label }}
    </option>
  </select>
</template>
