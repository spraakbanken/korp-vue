<script setup lang="ts">
import { ref } from "vue"
import KwicRow from "./KwicRow.vue"
import { isCorpusHeading, isKwic, type Row } from "@/core/kwic/kwic"
import { useElementVisibility, watchImmediate, whenever } from "@vueuse/core"
import { useLocale } from "@/i18n/useLocale"

const props = defineProps<{ data: Row[] }>()

const { locObj } = useLocale()

const scrollArea = ref<HTMLElement>()
const isVisible = useElementVisibility(scrollArea)
/** Counter to trigger re-render when data changes */
const dataCounter = ref(0)

watchImmediate(
  () => props.data,
  () => {
    dataCounter.value++
    // TODO Select first match token
    // Re-center, but wait for rendering to finish
    setTimeout(scrollToMatchColumn)
  },
)

// Re-center when becoming visible (e.g. switching to this tab)
whenever(isVisible, scrollToMatchColumn, { flush: "post" })

/** Scroll the KWIC table to center the match column */
function scrollToMatchColumn() {
  if (scrollArea.value) {
    const match = scrollArea.value.querySelector<HTMLElement>(".kwic-match")
    if (match) {
      scrollAreaHorizontally(scrollArea.value, match)
    }
  }
}

/** Scroll an area horizontally to center the target element */
function scrollAreaHorizontally(area: HTMLElement, target: HTMLElement) {
  const matchBox = target.getBoundingClientRect()
  const areaBox = area.getBoundingClientRect()
  const scrollLeft = area.scrollLeft + matchBox.left + matchBox.width / 2 - areaBox.width / 2
  // After setting `.scrollLeft`, it corrects itself to a value within range,
  // so this works also with RTL where `scrollLeft` is negative in some browsers.
  area.scrollLeft = -1e10
  area.scrollLeft += scrollLeft
}
</script>

<template>
  <div class="w-100 overflow-x-auto" ref="scrollArea">
    <table class="table table-sm text-nowrap">
      <tbody>
        <template v-for="(row, i) in data" :key="`${dataCounter} ${i}`">
          <tr v-if="isCorpusHeading(row)">
            <td class="bg-body-tertiary" />
            <td colspan="2" class="bg-body-tertiary">
              <h3 class="fs-5 my-1">{{ locObj(row.newCorpus) }}</h3>
            </td>
          </tr>

          <KwicRow v-if="isKwic(row)" :row />
        </template>
      </tbody>
    </table>
  </div>
</template>
