import type { Component } from "vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"

/** An attribute search widget component with possibly configured options */
export type Widget<O = Record<string, unknown>> = {
  component: Component
  options?: O
}

/** Props passed to a widget component */
export type WidgetProps<O = Record<string, unknown>> = {
  attribute: Attribute
  options: O
}
