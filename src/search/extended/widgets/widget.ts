import type { Component } from "vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import type { OperatorKorp } from "@/core/cqp/cqp.types"

/** An attribute search widget component with possibly configured options */
export type Widget<O = Record<string, unknown>> = {
  component: Component
  /** Skip escaping regex in user input, set to true if the widget emits regex values */
  noescape?: boolean
  options?: O
}

/** Props passed to a widget component */
export type WidgetProps<O = Record<string, unknown>> = {
  attribute: Attribute
  operator: OperatorKorp
  options: O
}
