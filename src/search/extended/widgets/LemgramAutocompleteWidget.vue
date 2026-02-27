<script setup lang="ts">
import LemgramAutocomplete, {
  type LemgramAutocompleteModel,
} from "@/search/LemgramAutocomplete.vue"
import { ref, watchEffect } from "vue"
import type { WidgetProps } from "./widget"

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

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps<LemgramAutocompleteOptions>>()

const lemgram = ref<LemgramAutocompleteModel>({ type: "word", value: "" })

// Emit value change if it matches the expected type.
watchEffect(() => {
  if (lemgram.value.type == (props.options.type || "lemgram")) {
    model.value = lemgram.value.value
  }
})
</script>

<template>
  <LemgramAutocomplete
    :count="options.variant != 'affix'"
    :morphologies="options.variant == 'dalin' ? ['dalinm'] : undefined"
    v-model="lemgram"
  />
</template>
