import { useDark as useDarkOriginal, type UseDarkOptions } from "@vueuse/core"

/** Wraps useDark from VueUse with custom settings */
export const useDark = (options?: UseDarkOptions) =>
  useDarkOriginal({
    attribute: "data-bs-theme",
    storageKey: "korp.ui.theme",
    ...options,
  })
