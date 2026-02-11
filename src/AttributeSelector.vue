<script lang="ts" setup>
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { useLocale } from "@/i18n/useLocale"
import { groupBy } from "lodash-es"
import { computed } from "vue"
import type { Attribute } from "./core/config/corpusConfigRaw.types"

const model = defineModel<Attribute | null>()

const props = defineProps<{
  disabled?: boolean
  options: AttributeOption[]
}>()

const emit = defineEmits<{
  (e: "change", value: Attribute | null): void
}>()

const { locObj } = useLocale()

const optionsGrouped = computed(() => groupBy(props.options, "group"))
</script>

<template>
  <select v-model="model" @change="emit('change', model || null)" :disabled class="form-select">
    <optgroup
      v-for="(options, type) in optionsGrouped"
      :key="type"
      :label="$t(`attribute_type.${type}`)"
    >
      <option v-for="option in options" :key="option.name" :value="option">
        {{ locObj(option.label) }}
      </option>
    </optgroup>
  </select>
</template>
