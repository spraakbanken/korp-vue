<script setup lang="ts">
import { computed, ref, useTemplateRef, watchEffect } from "vue"
import { Dropdown } from "bootstrap"
import { getGeoAttributes, type MapAttributeOption } from "@/core/statistics/map"
import HelpBadge from "@/components/HelpBadge.vue"
import useSearchStore from "@/search/useSearchStore"
import { storeToRefs } from "pinia"

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: "open", attribute: MapAttributeOption, relative: boolean): void
}>()

const { activeSearch } = storeToRefs(useSearchStore())

const dropdownEl = useTemplateRef("dropdown")
const relative = ref(true)
/** Attribute name of selected option */
const selected = ref<string>()

/** List of map-compatible attributes in the searched corpus set */
const options = computed<MapAttributeOption[]>(() =>
  getGeoAttributes(activeSearch.value?.corpora.corpora || []),
)

watchEffect(() => {
  // Reset selection if list is changed
  if (!selected.value || !options.value.find((option) => option.name == selected.value))
    selected.value = options.value[0]?.name || undefined
})

// Save and close dropdown
function confirm() {
  const option = options.value.find((option) => option.name == selected.value)
  if (!option) return
  emit("open", option, relative.value)
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
    :disabled="disabled || !options.length"
  >
    <fa-icon icon="fa-solid fa-earth-africa" />
    {{ $t("result.map") }}
  </button>

  <div class="dropdown-menu card p-0">
    <form @submit.prevent="confirm()">
      <h6 class="card-header">
        {{ $t("result.map.attribute") }}
      </h6>

      <div class="card-body">
        <!-- Attribute options -->
        <div v-for="attribute in options" :key="attribute.name" class="form-check">
          <input
            type="radio"
            :id="attribute.name"
            v-model="selected"
            :value="attribute.name"
            class="form-check-input"
          />
          <label class="form-check-label" :for="attribute.name">
            {{ $t(`result.map.attribute.${attribute.name}`) }}
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
        <input
          type="submit"
          class="btn btn-primary btn-sm"
          :value="$t('result.map.confirm')"
          :disabled="!selected"
        />
      </div>
    </form>
  </div>
</template>
