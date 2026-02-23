<script lang="ts" setup>
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { injectionKeys, type ComponentWithProps } from "@/injection"
import { computed, inject, useId } from "vue"
import DefaultWidget from "./widgets/DefaultWidget.vue"
import { getConfigurable } from "@/core/config"
import LemgramAutocompleteWidget from "./widgets/LemgramAutocompleteWidget.vue"
import type { MaybeConfigurable } from "@/core/config/config.types"

const model = defineModel<string>({ required: true })
const flags = defineModel<Record<string, true> | undefined>("flags")

const props = defineProps<{
  attribute: Attribute
}>()

const inputId = useId()

/** Registry of available non-default widgets */
const widgets: Record<string, MaybeConfigurable<ComponentWithProps>> = {
  autocExtended: (props) => ({ component: LemgramAutocompleteWidget, props }),
  ...inject(injectionKeys.search.widgets),
}

/** The computed widget to use */
const widget = computed<ComponentWithProps>(() => {
  const def = props.attribute.extended_component
  return (def && getConfigurable(widgets, def)) || { component: DefaultWidget }
})
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.value") }}</label>
    <component
      :is="widget.component"
      :id="inputId"
      v-bind="widget.props"
      v-model="model"
      v-model:flags="flags"
    />
  </div>
</template>
