<script setup lang="ts">
import type { SenseAutocompleteModel } from "@/search/SenseAutocomplete.vue"
import type { WidgetProps } from "./widget"
import { Saldo } from "@/core/saldo"
import SenseAutocomplete from "@/search/SenseAutocomplete.vue"

export type SenseAutocompleteOptions = {
  // TODO Implement
  error_on_empty?: boolean
}

const model = defineModel({
  required: true,
  get: (value: string): SenseAutocompleteModel =>
    Saldo.parse(value) ? { type: "sense", value } : { type: "word", value: "" },
  set: (value: SenseAutocompleteModel) => value.value,
})

defineProps<WidgetProps<SenseAutocompleteOptions>>()
</script>

<template>
  <SenseAutocomplete v-model="model" />
</template>
