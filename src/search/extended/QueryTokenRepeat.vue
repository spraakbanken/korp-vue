<script lang="ts" setup>
/** A token item in the query builder, with one or more conditions */
import HelpBadge from "@/components/HelpBadge.vue"
import { ref, useId, watch, watchEffect } from "vue"

const repeat = defineModel<[number, number] | undefined>()

const id = useId()
const enabled = ref(!!repeat.value)
const min = ref(repeat.value?.[0] ?? 1)
const max = ref(repeat.value?.[1] ?? 1)

// Update values from model
watchEffect(() => (enabled.value = !!repeat.value))

// Update model as the values are changed
watchEffect(() => (repeat.value = enabled.value ? [min.value, max.value] : undefined))

// Bump min/max if other is changed
watch(min, () => (max.value = Math.max(max.value, min.value)))
watch(max, () => (min.value = Math.min(min.value, max.value)))
</script>

<template>
  <div class="hstack">
    <div class="form-check form-switch text-nowrap">
      <input
        type="checkbox"
        :id="`${id}-repeat`"
        v-model="enabled"
        role="switch"
        class="form-check-input"
      />
      <label :for="`${id}-repeat`" class="form-check-label">
        {{ $t("search.extended.repeat") }}
      </label>
      <HelpBadge :text="$t('search.extended.repeat.help')" class="ms-1" />
    </div>

    <div v-if="enabled" class="input-group input-group-sm ms-2">
      <input
        type="number"
        v-model.number="min"
        min="0"
        max="99"
        class="form-control form-control-sm p-1 pe-0"
        :aria-label="$t('search.extended.repeat.min')"
      />
      <div class="input-group-text">–</div>
      <input
        type="number"
        v-model.number="max"
        min="1"
        max="99"
        class="form-control form-control-sm p-1 pe-0"
        :aria-label="$t('search.extended.repeat.max')"
      />
    </div>
  </div>
</template>

<style scoped>
input[type="number"] {
  width: 3em;
}
</style>
