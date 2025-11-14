import { Popover } from "bootstrap"

/** Directive for initalizing a popover. */
export const vPopover = {
  mounted(el: HTMLElement) {
    new Popover(el)
  },
}
