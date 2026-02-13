import { useElementVisibility, watchImmediate } from "@vueuse/core"
import type { DirectiveBinding, WatchSource } from "vue"

/** Watch a value and scroll this container horizontally to a target element whenever it changes */
export default function vScrollToTarget(
  el: HTMLElement,
  bindings: DirectiveBinding<{ watch: WatchSource; selector: string }>,
) {
  const isVisible = useElementVisibility(el)

  watchImmediate(
    [bindings.value.watch, isVisible],
    () => {
      const target = el.querySelector(bindings.value.selector)
      if (target && isVisible.value) scrollAreaHorizontally(el, target)
    },
    { flush: "post" },
  )
}

/** Scroll an area horizontally to center the target element */
export function scrollAreaHorizontally(area: Element, target: Element) {
  const matchBox = target.getBoundingClientRect()
  const areaBox = area.getBoundingClientRect()
  const scrollLeft = area.scrollLeft + matchBox.left + matchBox.width / 2 - areaBox.width / 2
  // After setting `.scrollLeft`, it corrects itself to a value within range,
  // so this works also with RTL where `scrollLeft` is negative in some browsers.
  area.scrollLeft = -1e10
  area.scrollLeft += scrollLeft
}
