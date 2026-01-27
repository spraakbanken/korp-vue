<script lang="ts" setup>
import AttributeSelector from "@/AttributeSelector.vue"
import { prefixAttr, unprefixAttr } from "@/core/config"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { onMounted, ref, useId, watch } from "vue"

/** Model shared with parent: attribute name */
const model = defineModel<string>({ required: true })

const inputId = useId()
const options = ref<AttributeOption[]>(corpusSelection.getAttributeGroupsExtended())
const findOption = (name: string) =>
  options.value.find((option) => option.name == unprefixAttr(name))
/** Model shared with selector child component: attribute object */
const attribute = ref<Attribute | null>(findOption(model.value) || null)

/** Get available attributes from current corpus selection */
function refresh() {
  if (!corpusSelection.corpora.length) return
  options.value = corpusSelection.getAttributeGroupsExtended()
  // If selected attribute is no longer available, reset selection
  attribute.value = findOption(model.value) || options.value[0]!
}

onMounted(refresh)
corpusSelection.listen(refresh)

// When an attribute is selected, update model with possibly prefixed name
watch(attribute, () => {
  if (attribute.value) model.value = prefixAttr(attribute.value)
})
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.attribute") }}</label>
    <AttributeSelector :options v-model="attribute" :id="inputId" />
  </div>
</template>
