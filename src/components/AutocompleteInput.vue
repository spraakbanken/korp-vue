<script lang="ts" setup generic="T">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue"
import { Dropdown } from "bootstrap"
import { useAsyncState } from "@vueuse/core"

export type Option<T> = { key: string; value: T }

const model = defineModel<string | T>({ required: true })

const props = defineProps<{
  loadSuggestions: (input: string) => Promise<Option<T>[]>
  valueToString?: (value: string | T) => string
}>()

let dropdown: Dropdown | undefined
const input = ref((props.valueToString || String)(model.value))
const inputEl = useTemplateRef("inputEl")
const menuEl = useTemplateRef("menuEl")

const { execute, isLoading, state } = useAsyncState(() => props.loadSuggestions(input.value), [])

onMounted(() => {
  dropdown = new Dropdown(inputEl.value!)
})

async function onInput() {
  // Emit raw input value
  model.value = input.value
  // Show dropdown and load suggestions
  dropdown?.show()
  execute()
}

/** Handle selection of an option */
function select(value: T) {
  // Emit selected value
  model.value = value
  // Fill input with selected value as string
  input.value = (props.valueToString || String)(value)
  // Hide dropdown and focus input
  dropdown?.hide()
  inputEl.value?.focus()
}

/** Open menu and focus first item */
// Bootstrap can handle a down-key press, but aborts if the target is a text input, so we need to reimplement it.
// See https://github.com/twbs/bootstrap/issues/41167
function onDownKey() {
  dropdown?.show()
  const item = menuEl.value?.querySelector(".dropdown-item:not(.disabled)")
  if (item instanceof HTMLElement) item.focus()
}

onUnmounted(() => {
  dropdown?.dispose()
})
</script>

<template>
  <div class="dropdown">
    <!-- Text input -->
    <input
      type="text"
      ref="inputEl"
      autocomplete="off"
      size="10"
      v-model="input"
      class="form-control"
      data-bs-toggle="dropdown"
      @input="onInput()"
      @keyup.down="onDownKey()"
      v-on="{ 'show.bs.dropdown': execute }"
    />

    <!-- Dropdown -->
    <ul class="dropdown-menu" ref="menuEl" style="min-width: 100%">
      <li v-if="isLoading" class="dropdown-item disabled">
        {{ $t("loading") }}
      </li>
      <li v-for="{ key, value } in state" :key>
        <a
          class="dropdown-item d-flex justify-content-between align-items-baseline gap-2"
          href="#"
          @click.prevent="select(value)"
        >
          <slot name="item" v-bind="{ value }">
            {{ value }}
          </slot>
        </a>
      </li>
    </ul>
  </div>
</template>
