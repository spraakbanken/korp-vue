<script lang="ts" setup>
import { computed, onUnmounted, useId, watchEffect } from "vue"
import type { WidgetProps } from "./widget"
import CaseInsensitivityToggle from "@/components/CaseInsensitivityToggle.vue"

export type DefaultWidgetOptions = {
  /** Set to true to skip the case-sensitivity toggle */
  case_sensitive?: boolean
}

const model = defineModel<string>({ required: true })
const flags = defineModel<Record<string, true> | undefined>("flags")

const props = defineProps<WidgetProps<DefaultWidgetOptions>>()

const id = useId()

const ignoreCase = computed({
  get: () => !!flags.value?.c,
  set: (value: boolean) => {
    // Note: This assumes that we only use the `c` flag. To support more, maybe create a helper to add/remove flags.
    flags.value = value ? { c: true } : undefined
  },
})

// Turn off the case-insensitive flag if the `case_sensitive` option is used
watchEffect(() => {
  if (props.options.case_sensitive) ignoreCase.value = false
})

onUnmounted(() => {
  // Clean up flag
  flags.value = undefined
})
</script>

<template>
  <div class="hstack gap-1">
    <input type="text" v-model="model" size="10" class="form-control" />

    <!-- Case-insensitive toggle button-->
    <CaseInsensitivityToggle v-if="!options.case_sensitive" v-model="ignoreCase" />
  </div>
</template>
