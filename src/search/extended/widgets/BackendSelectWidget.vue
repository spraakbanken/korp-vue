<script setup lang="ts">
import type { WidgetProps } from "./widget"
import useAttrValues from "./useAttrValues"
import { watchEffect } from "vue"

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps>()

const { options, loading } = useAttrValues(() => props.attribute)

// Reset invalid value
watchEffect(() => {
  if (options.value.length && options.value.find((option) => option[0] == model.value) == undefined)
    model.value = options.value[0]?.[0] || ""
})
</script>

<template>
  <select class="form-select" v-model="model" :disabled="loading">
    <!-- Use `:value="model"` so this option is shown by default -->
    <option v-if="loading" disabled :value="model">{{ $t("loading") }}</option>
    <option v-for="[value, label] in options" :key="value" :value>
      {{ label }}
    </option>
  </select>
</template>
