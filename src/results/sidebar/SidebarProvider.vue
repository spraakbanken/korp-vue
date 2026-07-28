<script setup lang="ts">
import { provide, useTemplateRef } from "vue"
import { type RowToken } from "@/core/kwic/kwic"
import KwicSidebar from "./KwicSidebar.vue"
import { injectionKeys } from "@/injection"

defineProps<{
  hideReadingMode?: boolean
}>()

const selectedToken = defineModel<RowToken>()

const text = useTemplateRef("text")

provide(injectionKeys.selectedToken, selectedToken)

/** Handle keyboard navigation */
function onKeydown(event: KeyboardEvent) {
  if (!(event.target instanceof Element)) return
  if (!event.target.classList.contains("kwic-token")) return
  const next = findNextToken(event.target, event.key)
  if (next) {
    next.click()
    next.focus()
    event.preventDefault()
  }
}

/** Find another token along a given arrow key direction */
function findNextToken(current: Element, key: string): HTMLElement | undefined {
  if (key == "ArrowLeft") return selectTokenX(current, -1)
  if (key == "ArrowRight") return selectTokenX(current, 1)
  if (key == "ArrowUp") return selectTokenY(current, -10)
  if (key == "ArrowDown") return selectTokenY(current, 10)
}

/** Find and select next/previous token in sequence */
function selectTokenX(current: Element, step: number): HTMLElement | undefined {
  const tokenEls = [...text.value!.getElementsByClassName("kwic-token")] as HTMLElement[]
  const currentIndex = tokenEls.findIndex((el) => el == current)
  return tokenEls[currentIndex + step]
}

/** Find and select token above or below */
function selectTokenY(current: Element, delta: number): HTMLElement | undefined {
  // Find center of current token
  const rect = current.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2

  for (let dy = delta; Math.abs(dy) <= 500; dy += delta) {
    // Include points slightly off the vertical, in case of whitespace
    for (const dx of [0, -3, 3]) {
      // Check if there is another token at this offset
      const els = document.elementsFromPoint(x + dx, y + dy) as HTMLElement[]
      const next = els.find((el) => el.classList.contains("kwic-token") && el != current)
      // Select found token
      if (next) return next
    }
  }
}
</script>

<template>
  <div
    class="position-relative"
    style="min-height: 50rem"
    :style="{
      // Make room for sidebar
      paddingInlineEnd: selectedToken ? '21rem' : undefined,
    }"
    @keydown="onKeydown"
  >
    <div ref="text">
      <slot />
    </div>

    <KwicSidebar style="width: 20rem" :hideReadingMode />
  </div>
</template>
