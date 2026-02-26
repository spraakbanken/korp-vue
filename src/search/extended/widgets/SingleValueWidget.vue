<script lang="ts" setup>
/** Foo bar */
import { onBeforeUnmount, onMounted, watch } from "vue"
import type { WidgetProps } from "./widget"

// To match children of a given element, e.g. `<subheading>Foo bar</subheading>`,
// the token has dummy attributes like `subheading_dummy="-"`,
// so this CQP condition needs to match that.
// The attribute is configured to use this widget,
// and provide the marker value (e.g. `"-"`) as an only value in `dataset`.
// TODO Replace this workaround, see https://github.com/spraakbanken/korp-frontend/issues/488

const model = defineModel<string>({ required: true })

const props = defineProps<WidgetProps>()

// Get marker value
const value = (props.attribute.dataset && Object.values(props.attribute.dataset)[0]) || "-"

onMounted(() => (model.value = value))

// Force model value to be the marker value
watch(model, () => (model.value = value))

// Remove meaningless marker value when switching attribute
// TODO This has no effect
onBeforeUnmount(() => (model.value = ""))
</script>

<template>
  <input type="hidden" :value />
</template>
