<script setup lang="ts">
import { getLemgrams, type LemgramCount } from "@/core/backend/lexicons"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { Lemgram } from "@/core/lemgram"
import { Dropdown } from "bootstrap"
import { throttle } from "lodash"
import { ref } from "vue"
import { useI18n } from "vue-i18n"

export type LemgramAutocompleteModel = { type: "lemgram" | "word"; value: string }

const { t } = useI18n()

const modelValue = defineModel<LemgramAutocompleteModel>({
  default: () => ({ type: "word", value: "" }),
})

/** Text in the form input */
const input = ref("")
const inputElement = ref<HTMLInputElement>()
const toggleElement = ref<HTMLButtonElement>()
const menuElement = ref<HTMLElement>()
/** Loaded lemgram options */
const options = ref<LemgramCount[]>([])

function onInput() {
  // Report plaintext input
  modelValue.value = { type: "word", value: input.value }
  // Do autocomplete
  loadSuggestions()
}

const loadSuggestions = throttle(async () => {
  // Fetch lemgrams and counts
  const data = await getLemgrams(input.value, ["saldom"], corpusSelection.getIds())
  // Get top 100
  options.value = data.sort((a, b) => b.count - a.count).slice(0, 100)
  openMenu()
}, 500)

function openMenu(focus = false) {
  const dropdown = Dropdown.getOrCreateInstance(toggleElement.value!)
  if (options.value.length) {
    dropdown?.show()

    if (focus) setTimeout(() => menuElement.value?.querySelector("a")?.focus())
    else
      // Reclaim focus from menu
      inputElement.value?.focus()
  } else {
    dropdown?.hide()
  }
}

const openMenuInBackground = () => setTimeout(() => openMenu())

function select(option: LemgramCount) {
  input.value = Lemgram.parse(option.lemgram)?.toString(t) || option.lemgram
  modelValue.value = { type: "lemgram", value: option.lemgram }
  // options.value = []
  const dropdown = Dropdown.getOrCreateInstance(toggleElement.value!)
  dropdown?.hide()
  inputElement.value?.focus()
}
</script>

<template>
  <div>
    <!-- Hidden label -->
    <label for="lemgram-autocomplete-input" class="visually-hidden" ref="inputElement">
      {{ $t("search.word_or_lemgram") }}
    </label>

    <!-- Input box -->
    <input
      id="lemgram-autocomplete-input"
      class="form-control"
      autocomplete="off"
      v-model="input"
      @input="onInput"
      @click="openMenuInBackground()"
      @keyup.down="openMenu(true)"
    />

    <div class="dropdown">
      <!-- Hidden dropdown toggle -->
      <button class="visually-hidden dropdown-toggle" data-bs-toggle="dropdown" ref="toggleElement">
        {{ $t("search.show_suggestions") }}
      </button>

      <!-- Dropdown menu with autocomplete suggestions -->
      <ul class="dropdown-menu" ref="menuElement" style="min-width: 100%">
        <li v-for="option in options" :key="option.lemgram">
          <a
            class="dropdown-item d-flex justify-content-between align-items-baseline"
            href="#"
            @click.prevent="select(option)"
            :style="{ color: !option.count ? 'var(--bs-dropdown-link-disabled-color)' : undefined }"
            :class="{ active: option.lemgram == modelValue.value }"
          >
            <span v-html="Lemgram.parse(option.lemgram)?.toHtml($t) || option.lemgram" />
            <span class="ms-2 badge text-secondary">
              <template v-if="option.count">{{ option.count }}</template>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
