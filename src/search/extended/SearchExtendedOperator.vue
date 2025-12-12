<script lang="ts" setup>
import settings from "@/core/config"
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { Condition, OperatorKorp } from "@/core/cqp/cqp.types"
import { computed, useId } from "vue"

const props = defineProps<{
  condition: Condition
}>()

const emit = defineEmits<{
  (e: "update", value: OperatorKorp): void
}>()

const id = useId()

const operators = computed(() => {
  const attributes = corpusSelection.getAttributeGroupsExtended()
  const attribute = attributes.find((attr) => attr.name == props.condition.type)!
  if (attribute.opts) return attribute.opts
  return settings["default_options"]
})

function update(event: Event) {
  const target = event.target as HTMLSelectElement
  emit("update", target.value as OperatorKorp)
}
</script>

<template>
  <div>
    <label :for="id" class="visually-hidden">{{ $t("search.extended.operator") }}</label>
    <select :id="id" class="form-select" @change="update">
      <option v-for="(operator, name) in operators" :key="name" :value="operator">
        {{ $t(`search.operator.${name}`) }}
      </option>
    </select>
  </div>
</template>
