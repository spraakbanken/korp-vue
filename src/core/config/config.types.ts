/** A value that names some object and possibly supplies options for that object. */
export type MaybeWithOptions<O extends {} = Record<string, any>> =
  | string
  | { name: string; options: O }

/** An object that possibly requires options for instantiation. */
export type MaybeConfigurable<T, O extends {} = {}> = T | Configurable<T, O>

/** An object that requires options for instantiation. */
export type Configurable<T, O extends {} = {}> = (options: O) => T
