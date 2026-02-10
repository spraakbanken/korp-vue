<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from "vue"
import { Dropdown } from "bootstrap"
import type { MapAttributeOption } from "@/core/statistics/map"
import HelpBadge from "@/components/HelpBadge.vue"

const props = defineProps<{
  /** Names of map-compatible attributes (private, no config available) */
  attributes: MapAttributeOption[]
}>()

const emit = defineEmits<{
  (e: "open", attribute: MapAttributeOption, relative: boolean): void
}>()

const dropdownEl = useTemplateRef("dropdown")
const relative = ref(true)
const selected = ref(props.attributes[0]!)

watchEffect(() => {
  // Reset selection if list is changed
  if (!props.attributes.includes(selected.value)) selected.value = props.attributes[0]!
})

// Save and close dropdown
function confirm() {
  emit("open", selected.value, relative.value)
  Dropdown.getOrCreateInstance(dropdownEl.value!).hide()
}
</script>

<template>
  <button
    type="button"
    ref="dropdown"
    class="btn btn-secondary dropdown-toggle"
    data-bs-toggle="dropdown"
    data-bs-auto-close="outside"
    aria-expanded="false"
    :disabled="!attributes.length"
  >
    {{ $t("result.map") }}
  </button>

  <div class="dropdown-menu card p-0">
    <form @submit.prevent="confirm()">
      <div class="card-header">
        {{ $t("result.map.attribute") }}
      </div>

      <div class="card-body">
        <!-- Attribute options -->
        <div v-for="attribute in attributes" :key="attribute.label" class="form-check">
          <input
            type="radio"
            :id="attribute.label"
            v-model="selected"
            :value="attribute"
            class="form-check-input"
          />
          <label class="form-check-label" :for="attribute.label">
            {{ $t(`result.map.attribute.${attribute.label}`) }}
          </label>
        </div>
      </div>

      <div class="card-footer hstack gap-2 align-items-baseline">
        <div class="form-check">
          <input type="checkbox" id="relative" class="form-check-input" v-model="relative" />
          <label class="form-check-label" for="relative">
            {{ $t("result.map.relative") }}
            <HelpBadge :text="$t('result.map.relative.help')" />
          </label>
        </div>
        <div class="flex-grow-1"></div>
        <input type="submit" class="btn btn-primary btn-sm" :value="$t('result.map.confirm')" />
      </div>
    </form>
  </div>
</template>
