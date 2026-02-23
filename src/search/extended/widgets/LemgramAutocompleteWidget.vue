<script setup lang="ts">
import LemgramAutocomplete, {
  type LemgramAutocompleteModel,
} from "@/search/LemgramAutocomplete.vue"
import { ref, watchEffect } from "vue"

export type LemgramAutocompleteWidgetProps = {
  // TODO Implement these in LemgramAutocomplete
  error_on_empty?: boolean
  type?: "lemgram" | "sense"
  /** Pipe-separated string of morphology resource names (`"saldom|dalinm"`), default is `"saldom"` */
  variant?: string
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
  <LemgramAutocomplete :morphologies="variant?.split('|')" v-model="lemgram" />
</template>
