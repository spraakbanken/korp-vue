<script setup lang="ts">
import type { SenseAutocompleteModel } from "@/search/SenseAutocomplete.vue"
import type { WidgetProps } from "./widget"
import { Saldo } from "@/core/saldo"
import SenseAutocomplete from "@/search/SenseAutocomplete.vue"

const model = defineModel({
  required: true,
  get: (value: string): SenseAutocompleteModel =>
    Saldo.parse(value) ? { type: "sense", value } : { type: "word", value: "" },
  set: (value: SenseAutocompleteModel) => value.value,
})

defineProps<WidgetProps>()
</script>

<template>
  <SenseAutocomplete v-model="model" />
</template>
