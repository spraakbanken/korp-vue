<script setup lang="ts">
import AutocompleteInput from "@/components/AutocompleteInput.vue"
import { getLemgrams, type LemgramCount } from "@/core/backend/lexicons"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { Lemgram } from "@/core/lemgram"
import { debounceAsync } from "@/core/util"
import { memoize } from "lodash-es"
import { ref, watchEffect } from "vue"
import { useI18n } from "vue-i18n"

export type LemgramAutocompleteModel = { type: "lemgram" | "word"; value: string }

const { t } = useI18n()

const model = defineModel<LemgramAutocompleteModel>({
  default: () => ({ type: "word", value: "" }),
})

const props = defineProps<{
  count?: boolean
  morphologies?: string[]
  size?: number
}>()

/** Text in the form input */
const input = ref<string | LemgramCount>("")

const valueToString = (value: string | LemgramCount) =>
  typeof value == "string" ? value : Lemgram.parse(value.lemgram)?.toString(t) || String(value)

// Emit raw or lemgram value
watchEffect(() => {
  model.value =
    typeof input.value == "string"
      ? { type: "word", value: input.value }
      : { type: "lemgram", value: input.value.lemgram }
})

// Debounce to reduce network load and visual disruption, memoize to reuse previous results
const loadSuggestions = debounceAsync(
  memoize(async (input: string) => {
    if (!input.trim()) return []

    // Fetch lemgrams and counts
    const morphologies = props.morphologies || []
    const data = await getLemgrams(input, morphologies, corpusSelection.getIds(), props.count)
    // Get top 100
    const top = data.sort((a, b) => b.count - a.count).slice(0, 100)
    // Shape options
    return top.map((item) => ({ key: item.lemgram, value: item }))
  }),
  500,
)
</script>

<template>
  <div>
    <!-- Hidden label -->
    <label for="lemgram-autocomplete-input" class="visually-hidden">
      {{ $t("search.word_or_lemgram") }}
    </label>

    <AutocompleteInput :loadSuggestions :size :valueToString v-model="input">
      <template v-slot:item="{ select, value }">
        <a
          class="dropdown-item d-flex justify-content-between align-items-baseline gap-2"
          href="#"
          :class="{ active: value.lemgram == model.value, zero: !value.count }"
          @click.prevent="select(value)"
        >
          <span v-html="Lemgram.parse(value.lemgram)?.toHtml($t) || value.lemgram" />
          <!-- Count is -1 if counting is disabled -->
          <span v-if="value.count > 0" class="badge text-secondary">
            {{ value.count }}
          </span>
        </a>
      </template>
    </AutocompleteInput>
  </div>
</template>

<style scoped>
.dropdown-item.zero {
  color: var(--bs-dropdown-link-disabled-color);
}
.dropdown-item.zero.active {
  background-color: var(--bs-primary-bg-subtle);
}
</style>
