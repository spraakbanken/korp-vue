<script lang="ts" setup>
import AttributeSelector from "@/AttributeSelector.vue"
import { prefixAttr, unprefixAttr } from "@/core/config"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import type { Condition } from "@/core/cqp/cqp.types"
import { onMounted, ref, useId, watch } from "vue"

const props = defineProps<{
  condition: Condition
}>()

const emit = defineEmits<{
  (e: "update", value: string): void
}>()

const inputId = useId()

const options = ref<AttributeOption[]>(corpusSelection.getAttributeGroupsExtended())
const findOption = (name: string) =>
  options.value.find((option) => option.name == unprefixAttr(name))
const selected = ref<Attribute>(findOption(props.condition.type) || options.value[0]!)

/** Get available attributes from current corpus selection */
function refresh() {
  options.value = corpusSelection.getAttributeGroupsExtended()

  // If selected attribute is no longer available, reset selection
  selected.value = findOption(props.condition.type) || options.value[0]!
}

onMounted(refresh)
corpusSelection.listen(refresh)

// Emit update event on selection change
watch(selected, () => {
  if (selected.value) emit("update", prefixAttr(selected.value))
})
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.attribute") }}</label>
    <AttributeSelector :options="options" v-model="selected" :id="inputId" />
  </div>
</template>
