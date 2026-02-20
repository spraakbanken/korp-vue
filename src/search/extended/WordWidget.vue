<script lang="ts" setup>
import { computed, onUnmounted, useId } from "vue"

const model = defineModel<string>({ required: true })
const flags = defineModel<Record<string, true> | undefined>("flags")

const id = useId()

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
    <input type="text" v-model="model" size="10" class="form-control" />

    <!-- Case-insensitive toggle button-->
    <input
      type="checkbox"
      :id="`${id}-ignorecase`"
      autocomplete="off"
      v-model="ignoreCase"
      class="btn-check"
    />
    <label class="btn btn-sm" :for="`${id}-ignorecase`">
      <abbr :title="$t('search.simple.ignore_case')">Aa</abbr>
    </label>
  </div>
</template>
