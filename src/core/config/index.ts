import type { InstanceConfig } from './instanceConfig.types'
import type { Attribute, MaybeConfigurable, MaybeWithOptions } from './corpusConfigRaw.types'
import type { CorpusConfig } from './corpusConfig.types'
import { getInstanceConfig } from './instanceConfig'
import { loadCorpusConfig } from './corpusConfig'
import { isFunction } from 'lodash'

/** A combination of frontend app settings and corpus config from backend. */
export type Config = InstanceConfig & CorpusConfig

/**
 * Settings read from app instance and later merged with corpus config from backend.
 *
 * Initially empty, must only be used after populating by awaiting `loadSettings()`.
 */
const settings: Config = {} as Config
export default settings as Readonly<Config>

declare global {
  interface Window {
    settings: Config
  }
}
if (import.meta.env.DEV) window.settings = settings

export async function loadSettings() {
  // Load instance settings (typically config.yml)
  const instanceConfig = getInstanceConfig()

  // Fetch config and info
  // TODO Remove hack: Add url to global settings to make korpRequest work
  settings.korp_backend_url = instanceConfig.korp_backend_url
  const corpusConfig = await loadCorpusConfig(instanceConfig)

  // Merge into global
  Object.assign(settings, instanceConfig, corpusConfig)
}

/**
 * Get an object from a registry with optional options.
 *
 * The definition is a name, or a name and options.
 * If the object is a function, the options are passed to it.
 */
export function getConfigurable<T>(
  registry: Record<string, MaybeConfigurable<T>>,
  definition: MaybeWithOptions,
): T | undefined {
  const name = typeof definition === 'string' ? definition : definition.name
  const widget = registry[name]
  if (isFunction(widget)) {
    const options = typeof definition == 'object' ? definition.options : {}
    return widget(options)
  }
  return widget
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
