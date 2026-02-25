<script lang="ts" setup>
import { computed } from "vue"
import useAttrValues from "./useAttrValues"
import type { WidgetProps } from "./widget"
import AutocompleteInput, { type Option } from "@/components/AutocompleteInput.vue"
import { until } from "@vueuse/core"

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps>()

const { options, loading } = useAttrValues(() => props.attribute, model)

const items = computed<Option<string>[]>(() =>
  options.value.map(([key, value]) => ({ key, value })),
)

/** Filtered options matching the current input */
async function getOptionsMatching(input: string) {
  // Wait for results the backend call
  await until(loading).not.toBeTruthy()
  // Show all options if input is empty
  if (!input) return items.value
  // Match options case-insensitively
  const lower = input.toLowerCase()
  return items.value.filter(({ value }) => value.toLowerCase().includes(lower))
}
</script>

<template>
  <AutocompleteInput v-model="model" :load-suggestions="getOptionsMatching" />
</template>
