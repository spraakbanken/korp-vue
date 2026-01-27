<script setup lang="ts">
import type { OperatorKorp } from "@/core/cqp/cqp.types"
import QueryBuilderValue from "./QueryBuilderValue.vue"
import { computed, ref, useId, watch } from "vue"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { corpusSelection } from "@/core/corpora/corpusListing"
import settings, { prefixAttr, unprefixAttr } from "@/core/config"
import AttributeSelector from "@/AttributeSelector.vue"

/** Model for selected attribute name */
const attribute = defineModel<string>("attribute", { required: true })
/** Model for selected operator */
const operator = defineModel<OperatorKorp>("operator", { required: true })
/** Model for input value */
const value = defineModel<string>("value", { required: true })

const inputId = useId()
/** Available attribute options */
const attributeOptions = ref<AttributeOption[]>([])
/** Attribute object matching the currently selected attribute name */
const attributeObject = computed(() =>
  attributeOptions.value.find((attr) => attr.name == unprefixAttr(attribute.value)),
)
/** Available operator options for the selected attribute */
const operatorOptions = computed(() => attributeObject.value?.opts || settings["default_options"])

/** Update available attributes */
function refresh() {
  if (!corpusSelection.corpora.length) return
  attributeOptions.value = corpusSelection.getAttributeGroupsExtended()
}

// Set attribute options initially and on corpus selection changes
refresh()
corpusSelection.listen(refresh)

watch(attributeObject, () => {
  // If selected attribute is no longer available, reset selection
  if (!attributeObject.value) attribute.value = "word"
})

watch(operatorOptions, () => {
  // If selected operator does not exist for the current (newly selected) attribute, select first operator
  const ops = Object.values(operatorOptions.value)
  if (!operator.value || !ops.includes(operator.value)) operator.value = ops[0]!
})

watch(attribute, refresh)
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
        :model-value="attributeObject"
        @update:model-value="(attr) => (attribute = attr ? prefixAttr(attr) : '')"
        :id="`${inputId}-attr`"
      />
    </div>

    <div class="hstack gap-1">
      <div>
        <!-- Operator -->
        <label :for="`${inputId}-op`" class="visually-hidden">
          {{ $t("search.extended.operator") }}
        </label>
        <select :id="`${inputId}-op`" class="form-select" v-model="operator">
          <option v-for="(op, name) in operatorOptions" :key="name" :value="op">
            {{ $t(`search.operator.${name}`) }}
          </option>
        </select>
      </div>

      <!-- Value -->
      <QueryBuilderValue v-model="value" class="flex-grow-1" />
    </div>
  </div>
</template>
