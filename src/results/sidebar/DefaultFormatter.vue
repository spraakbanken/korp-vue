<script setup lang="ts">
import { compact } from "lodash-es"
import { type FormatterProps } from "../formatter"
import { computed } from "vue"
import EmptyValue from "../EmptyValue.vue"
import DefaultFormatterItem from "./DefaultFormatterItem.vue"

const props = defineProps<FormatterProps>()

const isEmpty = computed(
  () =>
    props.value == undefined ||
    props.value == "" ||
    (props.attribute.type == "set" && props.value == "|"),
)
</script>

<template>
  <!-- No value -->
  <EmptyValue v-if="isEmpty && !isCustom" />

  <!-- Multi-value attribute -->
  <ul v-else-if="attribute.type == 'set' && value" class="list-unstyled my-0">
    <li v-for="(item, i) in compact(value.split('|'))" :key="i">
      <DefaultFormatterItem :attribute :item :rowToken />
    </li>
  </ul>

  <!-- Single-value attribute -->
  <DefaultFormatterItem v-else :attribute :item="value!" :rowToken />
</template>

<style scoped>
tr:last-child th,
tr:last-child td {
  border-bottom: 0;
}
</style>
