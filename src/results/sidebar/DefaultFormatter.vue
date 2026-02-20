<script setup lang="ts">
import { useStringifiers } from "@/attributes/useStringifiers"
import type { ApiKwic, Token } from "@/core/backend/types"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { compact, template } from "lodash-es"

const props = defineProps<{
  attribute: Attribute
  isCustom?: boolean
  row: ApiKwic
  token: Token
  value?: string
}>()

const stringify = useStringifiers()(props.attribute)

const isEmpty =
  props.value == undefined ||
  props.value == "" ||
  (props.attribute.type == "set" && props.value == "|")

/** Enhanced stringification for sidebar */
function formatValue(value: string) {
  value = stringify(value)

  if (value && props.attribute.type == "url")
    value = `<a href="${value}" target="_blank" rel="noopener">${value.replace(/^https?:\/\//, "")}</a>`

  if (props.attribute.pattern)
    value = template(props.attribute.pattern)({
      key: props.attribute.name,
      val: value,
      pos_attrs: props.token,
      struct_attrs: props.row.structs,
    })

  return value
}
</script>

<template>
  <!-- No value -->
  <span v-if="isEmpty && !isCustom" class="text-muted">∅</span>

  <!-- Multi-value attribute -->
  <ul v-else-if="attribute.type == 'set' && value" class="list-unstyled my-0">
    <li v-for="(item, i) in compact(value.split('|'))" :key="i">
      <!-- Split a ranked value as "<value>:<score>" -->
      <div v-if="attribute.ranked">
        <span v-html="formatValue(item.split(':')[0]!)" />
        {{}}
        <span class="text-muted small ms-2 text-nowrap">
          {{ Number(item.split(":")[1]).toPrecision(3) }}
        </span>
      </div>

      <!-- Print normal value -->
      <span v-else v-html="formatValue(item)" />
    </li>
  </ul>

  <!-- Single-value attribute -->
  <span v-else v-html="formatValue(value!)" />
</template>
