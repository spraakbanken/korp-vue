/** @file Types for how the Vue app is set up and interacts with instance code. */

export type InstancePluginOptions = {
  mode: string
}

// I18n //

export type Locale = Record<string, string>

export type LocalesByLang = Record<string, Locale>
