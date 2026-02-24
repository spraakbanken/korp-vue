<script setup lang="ts">
import type { WidgetProps } from "./widget"
import useAttrValues from "./useAttrValues"

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps>()

const { options, loading } = useAttrValues(() => props.attribute, model)
</script>

<template>
  <select class="form-select" v-model="model" :disabled="loading">
    <option v-if="loading" disabled value="">{{ $t("loading") }}</option>
    <option v-for="[value, label] in options" :key="value" :value>
      {{ label }}
    </option>
  </select>
</template>
