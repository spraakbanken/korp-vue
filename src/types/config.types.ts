/** @file Types for the corpus config and app settings. */

export type AttributeConfig = {
  extended_component?: SearchWidget
}

export type SearchWidget = string | SearchWidgetConfigurable

export type SearchWidgetConfigurable = {
  name: string
  options: Record<string, unknown>
}
