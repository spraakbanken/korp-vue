import { useDark, watchImmediate } from "@vueuse/core"
import { mapValues } from "lodash-es"
import { reactive, readonly } from "vue"

/**
 * Computed CSS property values for a few predefined Bootstrap variables.
 *
 * Updated when switching between light/dark mode.
 * Using `useCssVar()` from VueUse would stop the variable from changing when the theme changes.
 */
export function useTheme() {
  const isDark = useDark()

  const values = reactive(getValues())

  // Read current values of the listed CSS vars
  function getValues() {
    const html = document.firstElementChild
    const style = window.getComputedStyle(html!)
    return mapValues(NAME_MAP, (varName) => style.getPropertyValue(varName))
  }

  // Update values whenever light/dark theme is changed
  watchImmediate(isDark, () => Object.assign(values, getValues()))

  return readonly(values)
}

const NAME_MAP = {
  primary: "--bs-primary",
  secondary: "--bs-secondary",
  success: "--bs-success",
  info: "--bs-info",
  warning: "--bs-warning",
  danger: "--bs-danger",
  bodyColor: "--bs-body-color",
  secondaryBg: "--bs-secondary-bg",
  secondaryColor: "--bs-secondary-color",
}
