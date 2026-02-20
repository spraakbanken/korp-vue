<script setup lang="ts">
import type { OperatorKorp } from "@/core/cqp/cqp.types"
import QueryBuilderValue from "./QueryBuilderValue.vue"
import { computed, reactive, ref, useId, watch, watchEffect } from "vue"
import settings, { prefixAttr, unprefixAttr } from "@/core/config"
import AttributeSelector from "@/AttributeSelector.vue"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { regescape, unregescape } from "@/core/util"

/** Model for selected attribute name */
const name = defineModel<string>("attribute", { required: true })
/** Model for selected operator */
const operator = defineModel<OperatorKorp>("operator", { required: true })
/** Model for input value */
const value = defineModel<string>("value", { required: true })
/** Model for condition flags */
const flags = defineModel<Record<string, true> | undefined>("flags")

/**
 * Whether input value should be used raw, not escaped.
 * The backend interprets regex, so user-entered values should be escaped unless otherwise specified by certain operators or attribute config.
 */
const isRegex = () =>
  attribute.value?.escape === false ||
  ["*=", "!*=", "regexp_contains", "not_regexp_contains"].includes(operator.value)

const corpusSelection = useReactiveCorpusSelection()

const inputId = useId()
/** Available attribute options */
const attributeOptions = computed(() => corpusSelection.getAttributeGroupsExtended())
/** Attribute object matching the currently selected attribute name */
const attribute = computed(() =>
  attributeOptions.value.find((attr) => attr.name == unprefixAttr(name.value)),
)
/** Available operator options for the selected attribute */
const operatorOptions = computed(() => attribute.value?.opts || settings["default_options"])
/** User-facing value, unescaped for regex. */
const valueInput = ref<string>(isRegex() ? value.value : unregescape(value.value))

watch(attribute, () => {
  // If selected attribute is no longer available, reset selection
  if (!attribute.value) name.value = "word"
})

watch(operatorOptions, () => {
  // If selected operator does not exist for the current (newly selected) attribute, select first operator
  const ops = Object.values(operatorOptions.value)
  if (!operator.value || !ops.includes(operator.value)) operator.value = ops[0]!
})

// If regex requirements change, update value to add/remove escaping
watchEffect(() => (value.value = isRegex() ? valueInput.value : regescape(valueInput.value)))
</script>

<template>
  <div class="flex-grow-1 vstack gap-1">
    <div>
      <!-- Attribute -->
      <label :for="`${inputId}-attr`" class="visually-hidden">
        {{ $t("search.extended.attribute") }}
      </label>
      <!-- Instead of the v-model syntax, use v-bind and event handler explicitly to convert between our `string` model and the child component's `Attribute` model. -->
      <AttributeSelector
        :options="attributeOptions"
        :model-value="attribute"
        @update:model-value="(attr) => (name = attr ? prefixAttr(attr) : '')"
        :id="`${inputId}-attr`"
      />
    </div>

    <div class="hstack gap-1">
      <!-- Operator -->
      <div>
        <label :for="`${inputId}-op`" class="visually-hidden">
          {{ $t("search.extended.operator") }}
        </label>
        <select :id="`${inputId}-op`" class="form-select" v-model="operator">
          <option v-for="(value, key) in operatorOptions" :key :value>
            {{ $t(`search.operator.${key}`) }}
          </option>
        </select>
      </div>

      <!-- Value -->
      <QueryBuilderValue
        v-if="attribute"
        :attribute
        v-model="valueInput"
        v-model:flags="flags"
        class="flex-grow-1"
      />
    </div>
  </div>
</template>
