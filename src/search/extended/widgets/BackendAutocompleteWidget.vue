<script lang="ts" setup>
import { computed, onMounted, useTemplateRef } from "vue"
import useAttrValues from "./useAttrValues"
import type { WidgetProps } from "./widget"
import { Dropdown } from "bootstrap"

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps>()

const { options, loading } = useAttrValues(() => props.attribute, model)

let dropdown: Dropdown | undefined
const inputEl = useTemplateRef("inputEl")
const menuEl = useTemplateRef("menuEl")

/** Filtered options matching the current input */
const optionsMatching = computed(() => {
  // Show all options if input is empty
  if (!model.value) return options.value
  // Match options case-insensitively
  const lower = model.value.toLowerCase()
  return options.value.filter(([value]) => value.toLowerCase().includes(lower))
})

onMounted(() => {
  dropdown = new Dropdown(inputEl.value!)
})

/** Handle selection of an option */
function select(value: string) {
  // Emit selected value
  model.value = value
  // Hide dropdown and focus input
  dropdown?.hide()
  inputEl.value?.focus()
}

/** Open menu and focus first item */
// Bootstrap can handle a down-key press, but aborts if the target is a text input, so we need to reimplement it.
// See https://github.com/twbs/bootstrap/issues/41167
function onDownKey() {
  dropdown?.show()
  const firstItem = menuEl.value?.querySelector(".dropdown-item:not(.disabled)")
  if (firstItem instanceof HTMLElement) {
    firstItem.focus()
  }
}
</script>

<template>
  <div class="dropdown">
    <!-- Text input -->
    <input
      type="text"
      ref="inputEl"
      autocomplete="off"
      size="10"
      v-model="model"
      class="form-control"
      data-bs-toggle="dropdown"
      @input="dropdown?.show()"
      @keyup.down="onDownKey()"
    />

    <!-- Dropdown -->
    <ul class="dropdown-menu" ref="menuEl" style="min-width: 100%">
      <li v-if="loading" class="dropdown-item disabled">
        {{ $t("loading") }}
      </li>
      <li v-for="[value, label] in optionsMatching" :key="value">
        <a
          class="dropdown-item d-flex justify-content-between align-items-baseline gap-2"
          href="#"
          @click.prevent="select(value)"
        >
          {{ label }}
        </a>
      </li>
    </ul>
  </div>
</template>
