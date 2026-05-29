<script setup lang="ts">
import { compact } from "lodash-es"
import { type FormatterProps } from "../formatter"
import { computed } from "vue"
import EmptyValue from "../EmptyValue.vue"
import DefaultFormatterItem from "./DefaultFormatterItem.vue"
import ExpandableList from "./ShortenedList.vue"

const props = defineProps<FormatterProps>()

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
      <DefaultFormatterItem :attribute :item :rowToken />
    </template>
  </ExpandableList>

  <!-- Single-value attribute -->
  <DefaultFormatterItem v-else :attribute :item="value ?? ''" :rowToken />
</template>
