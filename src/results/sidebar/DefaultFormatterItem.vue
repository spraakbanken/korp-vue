<script setup lang="ts">
import { useStringifiers } from "@/attributes/useStringifiers"
import { isKwicRowToken, type RowToken } from "@/core/kwic/kwic"
import { template } from "lodash-es"
import DetailsDropdown from "@/components/DetailsDropdown.vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { computed } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { createAttrCondition } from "@/core/corpora/attribute"
import { stringify as stringifyCqp } from "@/core/cqp/cqp"

const props = defineProps<{
  attribute: Attribute
  item: string
  rowToken: RowToken
}>()

const store = useAppStore()
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

function search() {
  let val = props.item
  if (props.attribute.ranked) val = val.replace(/:.*/, "")
  const query = [{ and_block: [[createAttrCondition(props.attribute, val)]] }]

  store.search = "cqp"
  store.search_tab = 1
  store.cqp = stringifyCqp(query)
}
</script>

<template>
  <DetailsDropdown
    v-if="attribute.ranked || attribute.external_search || attribute.internal_search"
  >
    <table class="table table-sm m-0">
      <tbody>
        <tr v-if="attribute.ranked">
          <th>{{ $t("result.sidebar.rank_score") }}</th>
          <td>{{ Number(item.split(":")[1]).toPrecision(3) }}</td>
        </tr>

        <tr v-if="attribute.internal_search">
          <td colspan="2">
            <a href="#" @click.prevent="search()">
              {{ $t("result.sidebar.search") }}
            </a>
          </td>
        </tr>

        <tr v-if="attribute.external_search">
          <td colspan="2">
            <a
              :href="template(attribute.external_search)({ val: stringify(item) })"
              target="_blank"
              class="icon-link"
            >
              <img src="@/assets/karp_icon.svg" alt="Karp icon" style="height: 1em" />
              {{ $t("result.sidebar.search_karp") }}
            </a>
          </td>
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
