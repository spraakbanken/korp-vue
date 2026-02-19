import { compact } from "lodash-es"
import { type Directive } from "vue"

const vFadeIfLoading: Directive<HTMLElement, number | undefined> = {
  mounted(el) {
    el.style.transition = compact([el.style.transition, "opacity 100ms"]).join(", ")
  },
  updated(el, progress) {
    const isLoading = progress.value != undefined && progress.value < 100
    el.style.opacity = isLoading ? "0.5" : "1"
  },
}

export default vFadeIfLoading
