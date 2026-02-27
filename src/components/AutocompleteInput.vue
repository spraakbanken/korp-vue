<script lang="ts" setup generic="T">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue"
import { Dropdown } from "bootstrap"
import { useAsyncState, watchImmediate } from "@vueuse/core"

export type Option<T> = { key: string; value: T }

const model = defineModel<string | T>({ required: true })

const props = defineProps<{
  loadSuggestions: (input: string) => Promise<Option<T>[]>
  size?: number
  valueToString?: (value: string | T) => string
}>()

let dropdown: Dropdown | undefined
/** String to show in input box: user input or stringified selected value */
const input = ref("")
const inputEl = useTemplateRef("inputEl")
const menuEl = useTemplateRef("menuEl")
/** Raw user input to use for lookup */
const raw = ref("")

const { execute, isLoading, state } = useAsyncState(() => props.loadSuggestions(raw.value), [])

onMounted(() => {
  dropdown = new Dropdown(inputEl.value!)
})

// If model value changes (from outside), update locals
watchImmediate(model, () => {
  input.value = (props.valueToString || String)(model.value)
  if (typeof model.value == "string") raw.value = model.value
})

async function onInput() {
  // Emit raw input value
  model.value = raw.value = input.value
  // Hide and show dropdown to trigger suggestions loading
  dropdown?.hide()
  dropdown?.show()
}

/** Handle selection of an option */
function select(value: T) {
  // Emit selected value
  model.value = value
  // Fill input with selected value as string, but leave raw input unchanged
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
  // Move focus in next tick, when suggestions loader has started
  // If loading is instant, focus is moved to first item as desired
  // If loading takes a moment, focus remains on the input
  setTimeout(() => {
    const item = menuEl.value?.querySelector(".dropdown-item:not(.disabled)")
    if (item instanceof HTMLElement) item.focus()
  })
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
      :size="size ?? 10"
      v-model="input"
      class="form-control"
      data-bs-toggle="dropdown"
      @input="onInput()"
      @keyup.down="onDownKey()"
      v-on="{ 'show.bs.dropdown': execute }"
    />

    <!-- Dropdown -->
    <ul
      class="dropdown-menu"
      ref="menuEl"
      :class="{ idnvisible: !isLoading && !state.length }"
      style="min-width: 100%"
    >
      <li v-if="isLoading" class="dropdown-item disabled">
        {{ $t("loading") }}
      </li>
      <li v-for="{ key, value } in state" :key>
        <slot name="item" v-bind="{ select, value }">
          <a class="dropdown-item" href="#" @click.prevent="select(value)">
            {{ value }}
          </a>
        </slot>
      </li>
    </ul>
  </div>
</template>
