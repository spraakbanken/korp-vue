/** @file Types for the corpus config and app settings. */

export type AppSettings = {
  default_language: string
  description: Record<string, string>
  korp_backend_url: string
  languages: { value: string; label: string }[]
}

export type AttributeConfig = {
  extended_component?: SearchWidget
}

export type SearchWidget = string | SearchWidgetConfigurable

export type SearchWidgetConfigurable = {
  name: string
  options: Record<string, unknown>
}
