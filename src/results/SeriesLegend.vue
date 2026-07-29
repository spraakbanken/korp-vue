<script lang="ts" setup>
import { useId } from "vue"

export type LegendItem = {
  /** HTML label */
  label: string
  /** CSS color value */
  color: string
}

defineProps<{
  legend: LegendItem[]
}>()

/** Labels of enabled series */
const model = defineModel<string[]>({ default: [] })

const id = useId()
</script>

<template>
  <div class="d-flex justify-content-end flex-wrap column-gap-3 align-items-baseline">
    <h4 class="visually-hidden">{{ $t("result.legend") }}</h4>
    <div v-for="({ color, label }, i) in legend" :key="label" class="form-check">
      <input
        type="checkbox"
        :id="`${id}-${i}`"
        :value="label"
        v-model="model"
        class="form-check-input"
        :style="{ backgroundColor: color, borderColor: color }"
      />
      <label :for="`${id}-${i}`" class="form-check-label" v-html="label" />
    </div>
  </div>
</template>
