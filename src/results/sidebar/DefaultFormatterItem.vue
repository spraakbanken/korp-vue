<script setup lang="ts">
/** @file Displays an individual value in the default attribute formatter */
import { useStringifiers } from "@/attributes/useStringifiers"
import { isKwicRowToken, type RowToken } from "@/core/kwic/kwic"
import { template } from "lodash-es"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { computed } from "vue"
import ItemDetails from "./ItemDetails.vue"

export type DefaultFormatterItemProps = {
  attribute: Attribute
  item: string
  rowToken: RowToken
}

const props = defineProps<DefaultFormatterItemProps>()

const stringify = useStringifiers()(props.attribute)

/** Enhanced stringification for sidebar */
const itemHtml = computed(() => {
  let value = stringify(props.item)

  // TODO Abbreviate displayed URL
  if (value && props.attribute.type == "url") {
    try {
      // Parse just to check validity
      new URL(value)
      value = `<a href="${value}" target="_blank" rel="noopener">${value.replace(/^https?:\/\//, "")}</a>`
    } catch {
      // Not a valid URL, leave as is
    }
  }

  if (props.attribute.pattern)
    value = template(props.attribute.pattern)({
      key: props.attribute.name,
      val: value,
      pos_attrs: props.rowToken.token.attrs,
      struct_attrs: isKwicRowToken(props.rowToken) ? props.rowToken.row : {},
    })

  return value
})
</script>

<template>
  <ItemDetails :attribute :item />

  <!-- Print formatted value -->
  <span v-html="itemHtml" />
</template>
