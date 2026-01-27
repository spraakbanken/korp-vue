<script setup lang="ts">
import type { OperatorKorp } from "@/core/cqp/cqp.types"
import QueryBuilderValue from "./QueryBuilderValue.vue"
import { ref, useId, watch } from "vue"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { corpusSelection } from "@/core/corpora/corpusListing"
import settings, { prefixAttr, unprefixAttr } from "@/core/config"
import AttributeSelector from "@/AttributeSelector.vue"

const attribute = defineModel<string>("attribute", { required: true })
const operator = defineModel<OperatorKorp>("operator", { required: true })
const value = defineModel<string>("value", { required: true })

const inputId = useId()
const attributeOptions = ref<AttributeOption[]>([])
const operatorOptions = ref<Record<string, OperatorKorp>>(settings["default_options"])

const findOption = (name: string) =>
  attributeOptions.value.find((option) => option.name == unprefixAttr(name))

function refresh() {
  if (!corpusSelection.corpora.length) return

  // Update available attributes
  attributeOptions.value = corpusSelection.getAttributeGroupsExtended()

  // If selected attribute is no longer available, reset selection
  const attributeObject = findOption(attribute.value)
  if (!attribute.value || !attributeObject) attribute.value = "word"

  // Update available operators
  operatorOptions.value = attributeObject?.opts || settings["default_options"]
  const operators = Object.values(operatorOptions.value)

  // If current operator is not available, select first option.
  if (!operator.value || !operators.includes(operator.value)) operator.value = operators[0]!
}

refresh()
corpusSelection.listen(refresh)
watch(attribute, refresh)
</script>

<template>
  <div class="flex-grow-1 vstack gap-1">
    <div>
      <!-- Attribute -->
      <label :for="`${inputId}-attr`" class="visually-hidden">
        {{ $t("search.extended.attribute") }}
      </label>
      <AttributeSelector
        :options="attributeOptions"
        :model-value="findOption(attribute)"
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
