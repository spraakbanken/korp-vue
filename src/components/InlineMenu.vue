<script setup lang="ts" generic="T = string">
export type InlineMenuOption = { value: T; label: string }

defineProps<{
  label: string
  name: string
  options: InlineMenuOption[]
}>()

const model = defineModel()
</script>

<template>
  <fieldset>
    <legend class="visually-hidden">{{ label }}</legend>
    <div class="btn-group align-baseline">
      <label
        v-for="{ value, label } in options"
        :key="value"
        class="btn"
        :class="value == model ? 'btn-text' : 'btn-link'"
      >
        <input type="radio" class="btn-check" :name :value v-model="model" />
        {{ label }}
      </label>
    </div>
  </fieldset>
</template>
