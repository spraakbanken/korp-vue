<script lang="ts" setup>
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { injectionKeys } from "@/injection"
import { computed, inject, useId } from "vue"
import DefaultWidget from "./widgets/DefaultWidget.vue"
import { getConfigurable } from "@/core/config"
import LemgramAutocompleteWidget from "./widgets/LemgramAutocompleteWidget.vue"
import type { MaybeConfigurable } from "@/core/config/config.types"
import DatasetSelectWidget from "./widgets/DatasetSelectWidget.vue"
import type { Widget } from "./widgets/widget"
import BackendSelectWidget from "./widgets/BackendSelectWidget.vue"
import BackendAutocompleteWidget from "./widgets/BackendAutocompleteWidget.vue"

const model = defineModel<string>({ required: true })
const flags = defineModel<Record<string, true> | undefined>("flags")

const props = defineProps<{
  attribute: Attribute
}>()

const inputId = useId()

/** Registry of available non-default widgets */
const widgets: Record<string, MaybeConfigurable<Widget>> = {
  autocExtended: (options) => ({ component: LemgramAutocompleteWidget, options }),
  datasetSelect: () => ({ component: DatasetSelectWidget }),
  structServiceSelect: () => ({ component: BackendSelectWidget }),
  structServiceAutocomplete: () => ({ component: BackendAutocompleteWidget }),
  ...inject(injectionKeys.search.widgets),
}

/** The computed widget to use */
const widget = computed<Widget>(() => {
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
      :attribute="attribute"
      :options="widget.options || {}"
      v-model="model"
      v-model:flags="flags"
    />
  </div>
</template>
