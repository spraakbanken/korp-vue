<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import KwicToken from "./KwicToken.vue"
import type { LinkedKwicRow } from "@/core/kwic/kwic"

const props = defineProps<{ row: LinkedKwicRow }>()

const tdEl = useTemplateRef("td")

onMounted(() => {
  const linkedTr = tdEl.value?.closest("tr")
  const mainTr = linkedTr?.previousElementSibling
  if (!tdEl.value || !linkedTr || !mainTr) {
    console.error("Cannot find main row of linked row", props.row)
    return
  }

  const mainTokens = mainTr?.querySelectorAll(".kwic-token")
  const linkedTokens = linkedTr?.querySelectorAll(".kwic-token")

  const main = getBounds([...mainTokens], mainTr)
  const linked = getBounds([...linkedTokens], linkedTr)

  const offset = main.center - linked.width / 2
  // Add offset as cell padding
  tdEl.value.style.paddingLeft = Math.min(offset, linked.space) + "px"
})

/** A helper to get horizontal coordinates relative to a container. */
function getBounds(els: Element[], container: Element) {
  const cont = container.getBoundingClientRect()
  const left = els[0].getBoundingClientRect().left - cont.left
  const right = els[els.length - 1].getBoundingClientRect().right - cont.left
  const width = right - left
  const center = left + width / 2
  const space = cont.width - width
  return { left, right, width, center, space }
}
</script>

<template>
  <tr>
    <td ref="td" colspan="3" class="fst-italic opacity-75">
      <KwicToken v-for="(token, i) in row.tokens" :key="i" :row-token="{ row, token }" />
    </td>
  </tr>
</template>
