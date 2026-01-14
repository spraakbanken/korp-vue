<script setup lang="ts">
import { ref } from "vue"
import KwicRow from "./KwicRow.vue"
import type { Row } from "@/core/kwic/kwic"
import { watchImmediate } from "@vueuse/core"

const props = defineProps<{ data: Row[] }>()

const scrollArea = ref<HTMLElement>()

watchImmediate(
  () => props.data,
  () => {
    // Wait for rendering
    setTimeout(scrollToMatchColumn)
  },
)

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
        <KwicRow v-for="(row, i) in data" :key="i" :row />
      </tbody>
    </table>
  </div>
</template>
