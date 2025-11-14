import { Popover, Tab } from "bootstrap"
import type { Directive } from "vue"

/** Directive for initalizing a popover. */
export const vPopover: Directive<HTMLElement> = {
  mounted(el) {
    new Popover(el)
  },
}

/** Directive for initalizing a tab. */
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
