<script setup lang="ts">
import { useStringifiers } from "@/attributes/useStringifiers"
import { isKwicRowToken, type RowToken } from "@/core/kwic/kwic"
import { template } from "lodash-es"
import DetailsDropdown from "@/components/DetailsDropdown.vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { computed } from "vue"

const props = defineProps<{
  attribute: Attribute
  item: string
  rowToken: RowToken
}>()

const stringify = useStringifiers()(props.attribute)

/** Enhanced stringification for sidebar */
const itemHtml = computed(() => {
  let value = stringify(props.item)

  if (value && props.attribute.type == "url")
    value = `<a href="${value}" target="_blank" rel="noopener">${value.replace(/^https?:\/\//, "")}</a>`

  if (props.attribute.pattern)
    value = template(props.attribute.pattern)({
      key: props.attribute.name,
      val: value,
      pos_attrs: props.rowToken.token,
      struct_attrs: isKwicRowToken(props.rowToken) ? props.rowToken.row : {},
    })

  return value
})
</script>

<template>
  <DetailsDropdown v-if="attribute.ranked">
    <table class="table table-sm m-0">
      <tbody>
        <tr>
          <th>{{ $t("result.sidebar.rank_score") }}</th>
          <td>{{ Number(item.split(":")[1]).toPrecision(3) }}</td>
        </tr>
      </tbody>
    </table>
  </DetailsDropdown>

  <!-- Print formatted value -->
  <span v-html="itemHtml" />
</template>

<style scoped>
tr:last-child th,
tr:last-child td {
  border-bottom: 0;
}
</style>
