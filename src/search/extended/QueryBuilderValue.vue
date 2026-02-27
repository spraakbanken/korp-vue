<script lang="ts" setup>
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { injectionKeys } from "@/injection"
import { computed, inject, useId } from "vue"
import DefaultWidget from "./widgets/DefaultWidget.vue"
import { getConfigurable } from "@/core/config"
import LemgramAutocompleteWidget from "./widgets/LemgramAutocompleteWidget.vue"
import type { MaybeConfigurable } from "@/core/config/config.types"
import DatasetSelectWidget from "./widgets/DatasetSelectWidget.vue"
import { type WidgetProps, type Widget } from "./widgets/widget"
import BackendSelectWidget from "./widgets/BackendSelectWidget.vue"
import BackendAutocompleteWidget from "./widgets/BackendAutocompleteWidget.vue"
import SingleValueWidget from "./widgets/SingleValueWidget.vue"
import DateIntervalWidget from "./widgets/DateIntervalWidget.vue"
import type { OperatorKorp } from "@/core/cqp/cqp.types"
import { regescape, unregescape } from "@/core/util"
import SenseAutocompleteWidget from "./widgets/SenseAutocompleteWidget.vue"

const model = defineModel<string>({
  required: true,
  get: (value) => (isRegex() ? value : unregescape(value)),
  set: (value) => (isRegex() ? value : regescape(value)),
})
const flags = defineModel<Record<string, true> | undefined>("flags")

const props = defineProps<{
  attribute: Attribute
  operator: OperatorKorp
}>()

const inputId = useId()

/**
 * Whether input value should be used raw, not escaped.
 * The backend interprets regex, so user-entered values should be escaped unless otherwise specified by certain operators, attribute config or widget.
 */
const isRegex = () =>
  props.attribute?.escape === false ||
  widget.value.noescape ||
  ["*=", "!*=", "regexp_contains", "not_regexp_contains"].includes(props.operator)

/** Registry of available non-default widgets */
const widgets: Record<string, MaybeConfigurable<Widget>> = {
  autocExtended: (options) => ({
    component: options.type == "sense" ? SenseAutocompleteWidget : LemgramAutocompleteWidget,
    options,
  }),
  datasetSelect: () => ({ component: DatasetSelectWidget }),
  dateInterval: () => ({ component: DateIntervalWidget }),
  default: (options) => ({ component: DefaultWidget, options }),
  singleValue: () => ({ component: SingleValueWidget }),
  structServiceSelect: () => ({ component: BackendSelectWidget }),
  structServiceAutocomplete: () => ({ component: BackendAutocompleteWidget }),
  ...inject(injectionKeys.search.widgets),
}

/** The computed widget to use */
const widget = computed<Widget>(() => {
  const def = props.attribute.extended_component
  return (def && getConfigurable(widgets, def)) || { component: DefaultWidget }
})

const widgetProps = computed<WidgetProps>(() => ({
  attribute: props.attribute,
  operator: props.operator,
  options: widget.value.options || {},
}))
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.value") }}</label>
    <component
      :is="widget.component"
      :id="inputId"
      v-bind="widgetProps"
      v-model="model"
      v-model:flags="flags"
    />
  </div>
</template>
