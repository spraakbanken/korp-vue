<script setup lang="ts">
import LemgramAutocomplete, {
  type LemgramAutocompleteModel,
} from "@/search/LemgramAutocomplete.vue"
import type { WidgetProps } from "./widget"
import { Lemgram } from "@/core/lemgram"

export type LemgramAutocompleteOptions = {
  // TODO Implement these in LemgramAutocomplete
  error_on_empty?: boolean
  type?: "lemgram" | "sense"
  /**
   * One or none of:
   * - `"dalin"` -> use `dalinm` morphology
   * - `"affix"` -> hide counts
   */
  variant?: "dalin" | "affix"
}

const model = defineModel({
  required: true,
  get: (value: string): LemgramAutocompleteModel =>
    Lemgram.parse(value) ? { type: "lemgram", value } : { type: "word", value: "" },
  set: (value: LemgramAutocompleteModel) => value.value,
})

defineProps<WidgetProps<LemgramAutocompleteOptions>>()
</script>

<template>
  <LemgramAutocomplete
    :count="options.variant != 'affix'"
    :morphologies="options.variant == 'dalin' ? ['dalinm'] : undefined"
    v-model="model"
  />
</template>
