<script lang="ts" setup>
import settings from "@/core/config"
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { Condition, OperatorKorp } from "@/core/cqp/cqp.types"
import { onMounted, ref, useId } from "vue"

const props = defineProps<{
  condition: Condition
}>()

const model = defineModel<OperatorKorp>({ required: true })

const id = useId()
const options = ref<Record<string, OperatorKorp>>(settings["default_options"])

/** Set available operators */
function refresh() {
  if (!corpusSelection.corpora.length) return
  const attributes = corpusSelection.getAttributeGroupsExtended()
  const attribute = attributes.find((attr) => attr.name == props.condition.type)
  options.value = attribute?.opts ? attribute.opts : settings["default_options"]

  // If selected operator is no longer available, reset selection
  if (!Object.values(options.value).includes(model.value)) {
    model.value = Object.values(options.value)[0]!
  }
}

onMounted(refresh)
corpusSelection.listen(refresh)
</script>

<template>
  <div>
    <label :for="id" class="visually-hidden">{{ $t("search.extended.operator") }}</label>
    <select :id="id" class="form-select" v-model="model">
      <option v-for="(operator, name) in options" :key="name" :value="operator">
        {{ $t(`search.operator.${name}`) }}
      </option>
    </select>
  </div>
</template>
