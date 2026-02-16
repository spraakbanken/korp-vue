import { Popover, Tab } from "bootstrap"
import type { Directive } from "vue"

/** Directive for initializing a popover. */
export const vPopover: Directive<HTMLElement> = {
  mounted(el) {
    new Popover(el)
  },
  unmounted(el) {
    const popover = Popover.getInstance(el)
    popover?.dispose()
  },
}

/** Directive for initializing a tab. */
export const vTab: Directive<HTMLElement> = {
  mounted(el) {
    const trigger = new Tab(el)
    el.role = "tab"
    el.dataset.bsToggle = "tab"
    el.addEventListener("click", (event) => {
      event.preventDefault()
      trigger.show()
    })
  },
}
