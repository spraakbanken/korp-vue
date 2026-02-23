import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import type { Component } from "vue"

/** An attribute value formatter component with possibly configured options */
export type Formatter<O = Record<string, unknown>> = {
  component: Component
  options?: O
}

/** Props passed to an attribute formatter component */
export type FormatterProps<O = Record<string, unknown>> = {
  attribute: Attribute
  options: O
}
