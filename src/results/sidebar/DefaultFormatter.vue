<script setup lang="ts">
import { useStringifier } from "@/attributes/useStringifier"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { compact } from "lodash-es"

const props = defineProps<{
  attribute: Attribute
  value?: string
}>()

const { stringify } = useStringifier(props.attribute)

const isEmpty =
  props.value == undefined ||
  props.value == "" ||
  (props.attribute.type == "set" && props.value == "|")
</script>

<template>
  <!-- No value -->
  <span v-if="isEmpty" class="text-muted">∅</span>

  <!-- Multi-value attribute -->
  <ul v-else-if="attribute.type == 'set' && value" class="list-unstyled my-0">
    <li v-for="(item, i) in compact(value.split('|'))" :key="i">
      <!-- Split a ranked value as "<value>:<score>" -->
      <div v-if="attribute.ranked">
        <span v-html="stringify(item.split(':')[0])" />
        {{}}
        <span class="text-muted small ms-2 text-nowrap">
          {{ Number(item.split(":")[1]).toPrecision(3) }}
        </span>
      </div>

      <!-- Print normal value -->
      <span v-else v-html="stringify(item)" />
    </li>
  </ul>

  <!-- Single-value attribute -->
  <span v-else v-html="stringify(value)" />
</template>
