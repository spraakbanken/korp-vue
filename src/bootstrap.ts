import type { Directive } from "vue"

const Popover = import("bootstrap").then((m) => m.Popover)
const Tab = import("bootstrap").then((m) => m.Tab)

/** Directive for initializing a popover. */
export const vPopover: Directive<HTMLElement> = {
  async mounted(el) {
    new (await Popover)(el)
  },
  async unmounted(el) {
    const popover = (await Popover).getInstance(el)
    popover?.dispose()
  },
}

/** Directive for initializing a tab. */
export const vTab: Directive<HTMLElement> = {
  async mounted(el) {
    const trigger = new (await Tab)(el)
    el.role = "tab"
    el.dataset.bsToggle = "tab"
    el.addEventListener("click", (event) => {
      event.preventDefault()
      trigger.show()
    })
  },
}
