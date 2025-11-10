import { computed, type WritableComputedRef } from "vue"

/** This converts `a?: A` to `a: A | undefined`, which is needed for correct typing of storeToRefs(). */
export type NormalizeOptional<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? Exclude<T[K], undefined> | undefined : T[K]
}

/** Helper for creating a Writable Computed to proxy an object property. */
export function paramHandler<T extends object, K extends keyof T>(
  params: Partial<T>,
  name: K,
  getDefault?: () => T[K],
): WritableComputedRef<T[K]> {
  return computed({
    get: () => params[name] || (getDefault?.() as T[K]),
    set: (value) => (params[name] = value != getDefault?.() ? value : undefined),
  })
}
