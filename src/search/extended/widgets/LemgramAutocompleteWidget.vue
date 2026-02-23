<script setup lang="ts">
import LemgramAutocomplete, {
  type LemgramAutocompleteModel,
} from "@/search/LemgramAutocomplete.vue"
import { ref, watchEffect } from "vue"

export type LemgramAutocompleteWidgetProps = {
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

const props = defineProps<LemgramAutocompleteWidgetProps>()

const model = defineModel<string>({ required: true })

const lemgram = ref<LemgramAutocompleteModel>({ type: "word", value: "" })

// Emit value change if it matches the expected type.
watchEffect(() => {
  if (lemgram.value.type == props.type) {
    model.value = lemgram.value.value
  }
})
</script>

<template>
  <LemgramAutocomplete
    :count="props.variant != 'affix'"
    :morphologies="variant == 'dalin' ? ['dalinm'] : undefined"
    v-model="lemgram"
  />
</template>
