<script setup lang="ts">
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { compact } from "lodash"

const props = defineProps<{
  attribute: Attribute
  value: string | undefined
}>()

const isEmpty =
  props.value == undefined ||
  props.value == "" ||
  (props.attribute.type == "set" && props.value == "|")
</script>

<template>
  <!-- No value -->
  <template v-if="isEmpty">∅</template>

  <!-- Multi-value attribute -->
  <ul v-else-if="attribute.type == 'set' && value" class="ps-1 my-0">
    <li v-for="(item, i) in compact(value.split('|'))" :key="i">
      <template v-if="attribute.ranked">
        <!-- Split a ranked value as "<value>:<score>" -->
        {{ item.split(":")[0] }}
        <span class="badge rounded-pill text-bg-secondary small px-1 ms-1">
          {{ Number(item.split(":")[1]).toFixed(2) }}
        </span>
      </template>
      <template v-else>
        {{ item }}
      </template>
    </li>
  </ul>

  <!-- Single-value attribute -->
  <template v-else>{{ value }} </template>
</template>
