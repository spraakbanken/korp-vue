<script setup lang="ts">
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { useLocale } from "@/i18n/useLocale"
import { sortBy } from "lodash"

const model = defineModel<string[]>({ default: [] })

defineProps<{
  attribute: Attribute
  options: [string, number][]
}>()

const { locObj } = useLocale()
</script>

<template>
  <select class="form-select" multiple size="1" v-model="model">
    <option value="" disabled selected>
      {{ $t("search.filters.add", [locObj(attribute.label)]) }}
    </option>

    <option
      v-for="[value, hits] in sortBy(
        options,
        (option) => option[1] == 0,
        (option) => !model.includes(option[0]),
      )"
      :key="value"
      :value
      :disabled="hits == 0"
    >
      {{ value }} ({{ hits }})
    </option>
  </select>
</template>
