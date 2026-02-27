<script setup lang="ts">
import AutocompleteInput from "@/components/AutocompleteInput.vue"
import { getSenses } from "@/core/backend/lexicons"
import { Saldo } from "@/core/saldo"
import { debounceAsync } from "@/core/util"
import { compact, memoize } from "lodash-es"
import { ref, watchEffect } from "vue"

export type SenseAutocompleteModel = { type: "sense" | "word"; value: string }

type SaldoTuple = { sense: Saldo; desc: Saldo }

const model = defineModel<SenseAutocompleteModel>({ required: true })

/** Text in the form input */
const input = ref<string | SaldoTuple>(model.value.value)

/** Try to format a value as a lemgram */
const valueToString = (value: string | SaldoTuple) => {
  // The value can be a selected Saldo object, a Saldo id string or any other string
  const str = typeof value == "string" ? value : value.sense.id
  return Saldo.parse(str)?.toString() || str
}

// Emit raw or lemgram value
watchEffect(() => {
  model.value =
    typeof input.value == "string"
      ? { type: "word", value: input.value }
      : { type: "sense", value: input.value.sense.id }
})

// Debounce to reduce network load and visual disruption, memoize to reuse previous results
const loadSuggestions = debounceAsync(
  memoize(async (input: string) => {
    if (!input.trim()) return []

    // Fetch lemgrams and counts
    const data = await getSenses(input)

    // Parse items
    const tuples = compact(
      data.map((item) => {
        const sense = Saldo.parse(item.sense)
        const desc = Saldo.parse(item.desc)
        if (!sense || !desc) {
          console.warn("Failed to parse as Saldo:", item)
          return null
        }
        return { sense, desc }
      }),
    )

    // Get top 100
    const top = tuples
      .sort((a, b) => {
        // Sort same-form senses by index, otherwise by length
        return a.sense.form === b.sense.form
          ? a.sense.index - b.sense.index
          : a.sense.id.length - b.sense.id.length
      })
      .slice(0, 100)

    // Shape options
    return top.map((item) => ({ key: item.sense.id, value: item }))
  }),
  500,
)
</script>

<template>
  <div>
    <AutocompleteInput :loadSuggestions :valueToString v-model="input">
      <template v-slot:item="{ select, value }">
        <a
          class="dropdown-item d-flex align-items-baseline gap-2"
          href="#"
          :class="{ active: value.sense.id == model.value }"
          @click.prevent="select(value)"
        >
          <span v-html="value.sense.toHtml()" />
          <span class="text-muted" v-html="value.desc.toHtml()" />
        </a>
      </template>
    </AutocompleteInput>
  </div>
</template>
