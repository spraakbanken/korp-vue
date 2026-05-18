import { useDark, watchImmediate } from "@vueuse/core"
import { computed, ref } from "vue"

/**
 * Computed CSS property value, updated when switching between light/dark mode.
 *
 * Using `useCssVar()` from VueUse will stop the variable from changing when the theme changes.
 */
export function useBootstrapThemeVar(name: string) {
  const isDark = useDark()
  const val = ref<string>()

  // Read value whenever light/dark theme is changed
  watchImmediate(isDark, () => {
    const html = document.firstElementChild
    if (!html) return
    const newValue = window.getComputedStyle(html).getPropertyValue(name)
    val.value = newValue
  })

  return computed(() => val.value)
}
