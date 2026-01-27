<script setup lang="ts">
import type { Condition } from "@/core/cqp/cqp.types"
import QueryBuilderOperator from "./QueryBuilderOperator.vue"
import QueryBuilderValue from "./QueryBuilderValue.vue"
import { ref, useId, watch } from "vue"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { prefixAttr, unprefixAttr } from "@/core/config"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import AttributeSelector from "@/AttributeSelector.vue"

const condition = defineModel<Condition>({ required: true })

const inputId = useId()
const attributeOptions = ref<AttributeOption[]>([])
const attributeModel = ref<Attribute | null>()

const findOption = (name: string) =>
  attributeOptions.value.find((option) => option.name == unprefixAttr(name))

function refresh() {
  if (!corpusSelection.corpora.length) return
  attributeOptions.value = corpusSelection.getAttributeGroupsExtended()
  // If selected attribute is no longer available, reset selection
  attributeModel.value = findOption(condition.value.type) || attributeOptions.value[0]!
}

refresh()
corpusSelection.listen(refresh)

// When an attribute is selected, update model with possibly prefixed name
watch(attributeModel, () => {
  if (attributeModel.value) condition.value.type = prefixAttr(attributeModel.value)
})
</script>

<template>
  <div class="flex-grow-1 vstack gap-1">
    <div>
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
      <QueryBuilderOperator :condition v-model="condition.op" />
      <QueryBuilderValue
        :condition
        @update="(value) => (condition.val = value)"
        class="flex-grow-1"
      />
    </div>
  </div>
</template>
