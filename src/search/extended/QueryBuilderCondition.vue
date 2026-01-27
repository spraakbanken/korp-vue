<script setup lang="ts">
import type { Condition, OperatorKorp } from "@/core/cqp/cqp.types"
import QueryBuilderValue from "./QueryBuilderValue.vue"
import { ref, useId, watch } from "vue"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { corpusSelection } from "@/core/corpora/corpusListing"
import settings, { prefixAttr, unprefixAttr } from "@/core/config"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import AttributeSelector from "@/AttributeSelector.vue"

const condition = defineModel<Condition>({ required: true })

const inputId = useId()
const attributeOptions = ref<AttributeOption[]>([])
const attributeModel = ref<Attribute | null>()
const operatorOptions = ref<Record<string, OperatorKorp>>(settings["default_options"])
const operatorModel = ref<OperatorKorp>()

const findOption = (name: string) =>
  attributeOptions.value.find((option) => option.name == unprefixAttr(name))

function refresh() {
  if (!corpusSelection.corpora.length) return

  // Update available attributes
  attributeOptions.value = corpusSelection.getAttributeGroupsExtended()

  // Set attribute selection. If selected attribute is no longer available, reset selection
  const attribute = findOption(condition.value.type) || attributeOptions.value[0]!
  attributeModel.value = attribute

  // Update available operators
  operatorOptions.value = attribute.opts || settings["default_options"]
  const operators = Object.values(operatorOptions.value)

  // Set operator selection. If current operator is not available, select first option.
  operatorModel.value = operators.includes(condition.value.op) ? condition.value.op : operators[0]!
}

refresh()
corpusSelection.listen(refresh)
watch(condition, refresh, { deep: true })

// When an attribute is selected, update model with possibly prefixed name
watch(attributeModel, () => {
  if (attributeModel.value) condition.value.type = prefixAttr(attributeModel.value)
})

// When an operator is selected, update model
watch(operatorModel, () => {
  if (operatorModel.value) condition.value.op = operatorModel.value
})
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
        v-model="attributeModel"
        :id="`${inputId}-attr`"
      />
    </div>

    <div class="hstack gap-1">
      <div>
        <!-- Operator -->
        <label :for="`${inputId}-op`" class="visually-hidden">
          {{ $t("search.extended.operator") }}
        </label>
        <select :id="`${inputId}-op`" class="form-select" v-model="operatorModel">
          <option v-for="(operator, name) in operatorOptions" :key="name" :value="operator">
            {{ $t(`search.operator.${name}`) }}
          </option>
        </select>
      </div>

      <!-- Value -->
      <QueryBuilderValue
        :condition
        @update="(value) => (condition.val = value)"
        class="flex-grow-1"
      />
    </div>
  </div>
</template>
