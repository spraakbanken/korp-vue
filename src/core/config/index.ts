import type { AppSettings } from './app-config.types'
import type { Attribute } from './config.types'
import type { ConfigTransformed } from './config-transformed.types'
import { getAppSettings } from './app-config'
import { loadConfig } from './config'

/** A combination of frontend app settings and corpus config from backend. */
// TODO ConfigTransformed
export type Settings = AppSettings & ConfigTransformed

/**
 * Settings read from app instance and later merged with corpus config from backend.
 *
 * Initially empty, must only be used after populating by awaiting `loadSettings()`.
 */
const settings: Settings = {} as Settings
export default settings as Readonly<Settings>

declare global {
  interface Window {
    settings: Settings
  }
}
if (import.meta.env.DEV) window.settings = settings

export async function loadSettings() {
  // Load instance settings (typically config.yml)
  const appSettings = getAppSettings()

  // Fetch config and info
  // TODO Remove hack: Add url to global settings to make korpRequest work
  settings.korp_backend_url = appSettings.korp_backend_url
  const config = await loadConfig(appSettings)

  // Merge into global
  Object.assign(settings, appSettings, config)
}

export function getDefaultWithin() {
  return Object.keys(settings['default_within'] || {})[0]
}

/** An attribute's dataset options as an object */
export const normalizeDataset = (
  dataset: NonNullable<Attribute['dataset']>,
): Record<string, string> =>
  Array.isArray(dataset) ? Object.fromEntries(dataset.map((k) => [k, k])) : dataset

/** Get attribute name for use in CQP, prepended with `_.` if it is a structural attribute. */
export const prefixAttr = (attr: Attribute): string =>
  attr['is_struct_attr'] ? `_.${attr.name}` : attr.name
