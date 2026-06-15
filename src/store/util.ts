/** This converts `a?: A` to `a: A | undefined`, which is needed for correct typing of storeToRefs(). */
export type NormalizeOptional<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? Exclude<T[K], undefined> | undefined : T[K]
}
