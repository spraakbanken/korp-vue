<script lang="ts" setup>
import { computed, onUnmounted } from "vue"
import type { WidgetProps } from "./widget"
import CaseInsensitivityToggle from "@/components/CaseInsensitivityToggle.vue"

export type DefaultWidgetOptions = {
  /** Writing direction: "rtl" or "ltr" (default) */
  dir?: string
  placeholder?: string
}

const model = defineModel<string>({ required: true })
const flags = defineModel<Record<string, true> | undefined>("flags")

defineProps<WidgetProps<DefaultWidgetOptions>>()

const ignoreCase = computed({
  get: () => !!flags.value?.c,
  set: (value: boolean) => {
    // Note: This assumes that we only use the `c` flag. To support more, maybe create a helper to add/remove flags.
    flags.value = value ? { c: true } : undefined
  },
})

onUnmounted(() => {
  // Clean up flag
  flags.value = undefined
})
</script>

<template>
  <div class="hstack gap-1">
    <input
      type="text"
      v-model="model"
      :dir="options.dir"
      size="10"
      class="form-control"
      :placeholder="options.placeholder"
    />

    <!-- Case-insensitive toggle button-->
    <CaseInsensitivityToggle v-model="ignoreCase" />
  </div>
</template>
