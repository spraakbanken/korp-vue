<script setup lang="ts">
/**
 * @file Default formatter for attribute values
 *
 * Splits multi-value attributes into items, or displays a single-value item.
 * Adds a details dropdown to each item if applicable.
 */
import { compact } from "lodash-es"
import { type FormatterProps } from "../formatter"
import { computed, type Component } from "vue"
import EmptyValue from "../EmptyValue.vue"
import DefaultFormatterItem, { type DefaultFormatterItemProps } from "./DefaultFormatterItem.vue"
import ExpandableList from "./ShortenedList.vue"

export type DefaultFormatterOptions = {
  /** A custom component to use for a single item when using the default formatter */
  itemComponent?: Component<DefaultFormatterItemProps>
}

const props = defineProps<FormatterProps>()

/** Component for displaying individual items */
const itemComponent = computed(() => props.options?.itemComponent || DefaultFormatterItem)

const isEmpty = computed(
  () =>
    props.value == undefined ||
    props.value == "" ||
    (props.attribute.type == "set" && props.value == "|"),
)

/** If the attribute is a set, this contains the value split by "|"; otherwise undefined */
const items = computed<string[] | undefined>(() =>
  props.attribute.type == "set" && props.value ? compact(props.value.split("|")) : undefined,
)
</script>

<template>
  <!-- No value -->
  <EmptyValue v-if="isEmpty && !isCustom" />

  <!-- Multi-value attribute -->
  <ExpandableList v-else-if="items" :items class="list-unstyled my-0">
    <template v-slot="{ item }">
      <component :is="itemComponent" :attribute :item :rowToken />
    </template>
  </ExpandableList>

  <!-- Single-value attribute -->
  <component v-else :is="itemComponent" :attribute :item="value ?? ''" :rowToken />
</template>
