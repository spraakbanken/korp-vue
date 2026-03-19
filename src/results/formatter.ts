import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import type { RowToken } from "@/core/kwic/kwic"
import type { Component } from "vue"

/** An attribute value formatter component with possibly configured options */
export type Formatter<O = Record<string, unknown>> = {
  component: Component<FormatterProps<O>>
  options?: O
}

/** Props passed to an attribute formatter component */
export type FormatterProps<O = Record<string, unknown>> = {
  attribute: Attribute
  isCustom?: boolean
  options?: O
  rowToken: RowToken
  value: string | null | undefined
}
