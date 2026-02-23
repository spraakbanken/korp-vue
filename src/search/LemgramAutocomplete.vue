<script setup lang="ts">
import { getLemgrams, type LemgramCount } from "@/core/backend/lexicons"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { Lemgram } from "@/core/lemgram"
import { watchImmediate } from "@vueuse/core"
import { Dropdown } from "bootstrap"
import { throttle } from "lodash-es"
import { ref, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"

export type LemgramAutocompleteModel = { type: "lemgram" | "word"; value: string }

const { t } = useI18n()

const model = defineModel<LemgramAutocompleteModel>({
  default: () => ({ type: "word", value: "" }),
})

const props = defineProps<{
  morphologies?: string[]
  count?: boolean
}>()

/** Text in the form input */
const input = ref("")
const inputElement = useTemplateRef("inputElement")
const toggleElement = useTemplateRef("toggleElement")
const menuElement = useTemplateRef("menuElement")
/** Loaded lemgram options */
const options = ref<LemgramCount[]>([])

/** Sync model value to input text */
watchImmediate(model, () => {
  input.value = Lemgram.parse(model.value.value)?.toString(t) || model.value.value
})

function onInput() {
  // Report plaintext input
  model.value = { type: "word", value: input.value }
  // Do autocomplete
  loadSuggestions()
}

const loadSuggestions = throttle(async () => {
  if (!input.value.trim()) {
    options.value = []
    openMenu()
    return
  }

  // Fetch lemgrams and counts
  const morphologies = props.morphologies || ["saldom"]
  const data = await getLemgrams(input.value, morphologies, corpusSelection.getIds(), props.count)
  // Get top 100
  options.value = data.sort((a, b) => b.count - a.count).slice(0, 100)
  openMenu()
}, 500)

function openMenu(focus = false) {
  const dropdown = Dropdown.getOrCreateInstance(toggleElement.value!)
  if (options.value.length) {
    dropdown.show()

    if (focus) setTimeout(() => menuElement.value?.querySelector("a")?.focus())
    else
      // Reclaim focus from menu
      inputElement.value?.focus()
  } else {
    dropdown.hide()
  }
}

const openMenuInBackground = () => setTimeout(() => openMenu())

function select(option: LemgramCount) {
  model.value = { type: "lemgram", value: option.lemgram }
  const dropdown = Dropdown.getOrCreateInstance(toggleElement.value!)
  dropdown.hide()
  inputElement.value?.focus()
}

/** Handle focus on the hidden dropdown toggle button. */
function passToggleFocus($event: FocusEvent) {
  const previousTarget = $event.relatedTarget as HTMLElement
  if (previousTarget == inputElement.value) menuElement.value?.querySelector("a")?.focus()
  else if (menuElement.value?.contains(previousTarget)) inputElement.value?.focus()
}
</script>

<template>
  <div class="text-start">
    <!-- Hidden label -->
    <label for="lemgram-autocomplete-input" class="visually-hidden">
      {{ $t("search.word_or_lemgram") }}
    </label>

    <!-- Input box -->
    <input
      id="lemgram-autocomplete-input"
      class="form-control"
      ref="inputElement"
      autocomplete="off"
      v-model="input"
      size="30"
      @input="onInput"
      @click="openMenuInBackground()"
      @keyup.down="openMenu(true)"
    />

    <div class="dropdown">
      <!-- Hidden dropdown toggle -->
      <button
        type="button"
        class="visually-hidden dropdown-toggle"
        data-bs-toggle="dropdown"
        ref="toggleElement"
        tabindex="-1"
        @focus="passToggleFocus"
      >
        {{ $t("search.show_suggestions") }}
      </button>

      <!-- Dropdown menu with autocomplete suggestions -->
      <ul class="dropdown-menu" ref="menuElement" style="min-width: 100%">
        <li v-for="option in options" :key="option.lemgram">
          <a
            class="dropdown-item d-flex justify-content-between align-items-baseline gap-2"
            href="#"
            @click.prevent="select(option)"
            :style="{ color: !option.count ? 'var(--bs-dropdown-link-disabled-color)' : undefined }"
            :class="{ active: option.lemgram == model.value }"
          >
            <span v-html="Lemgram.parse(option.lemgram)?.toHtml($t) || option.lemgram" />
            <!-- Count is -1 if counting is disabled -->
            <span v-if="option.count > 0" class="badge text-secondary">
              {{ option.count }}
            </span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
