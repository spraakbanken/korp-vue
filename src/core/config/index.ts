/** @format */
import currentMode from '@/core/corpora/mode'
import type { AppSettings } from './app-config.types'
import type { Attribute, Config } from './config.types'
import { transformConfig, type InfoData } from './transform'
import { korpRequest } from '../api/common'
import type { ConfigTransformed } from './config-transformed.types'
import { fromKeys } from '../util'

/** A combination of frontend app settings and corpus config from backend. */
// TODO ConfigTransformed
export type Settings = AppSettings & ConfigTransformed

/**
 * Settings read from app instance and later merged with corpus config from backend.
 *
 * Initially empty, must only be used after populating by awaiting `loadSettings()`.
 */
const settings: Settings = {} as Settings
export default settings

declare global {
  interface Window {
    settings: Settings
  }
}
if (import.meta.env.DEV) window.settings = settings

export async function loadSettings() {
  // 1. Read original instance app settings
  const appSettings = { ...(await import('@instance/settings')).default }

  // 2. Validate/fix/add defualts
  setDefaultConfigValues(appSettings)

  // Normalize and validate backend URL
  appSettings.korp_backend_url = appSettings.korp_backend_url.trim().replace(/\/$/, '')
  if (!appSettings.korp_backend_url.startsWith('http')) {
    throw new Error('Setting "korp_backend_url" must start with http(s)')
  }

  // TODO: Remove hack: Add to global settings temporarily to make korpRequest work
  settings.korp_backend_url = appSettings.korp_backend_url

  // 3. Fetch config
  const config = await korpRequest('corpus_config', { mode: currentMode })

  // 4. Fetch info
  const infos = await getInfoData(Object.keys(config.corpora))

  // 6. Transform config+info
  const transformed = transformConfig(config, infos)

  // 7. Merge config
  const merged = { ...appSettings, ...transformed } as Settings

  // 8. Set global
  Object.assign(settings, merged)
}

async function getInfoData(corpusIds: string[]): Promise<InfoData> {
  if (!corpusIds.length) return {}

  const params = { corpus: corpusIds.map((id) => id.toUpperCase()).join(',') }
  const data = await korpRequest('corpus_info', params)

  return fromKeys(corpusIds, (corpusId) => ({
    info: data.corpora[corpusId.toUpperCase()].info,
    private_struct_attributes: data.corpora[corpusId.toUpperCase()].attrs.s.filter(
      (name) => name.indexOf('__') !== -1,
    ),
  }))
}

/**
 * function to set default values if parameters have been left out of config.js
 */
export function setDefaultConfigValues(settings: AppSettings) {
  settings['hits_per_page_values'] ??= [25, 50, 75, 100]
  settings['group_statistics'] ??= []
  // The default maximum URI length for Apache is 8190 but keep
  // some safety margin
  settings['backendURLMaxLength'] ??= 8100
  settings['default_language'] ??= 'eng'
  settings['default_options'] ??= { is: '=', is_not: '!=' }
  // codes for translation ISO-639-1 to 639-2
  settings['iso_languages'] ??= {
    en: 'eng',
    sv: 'swe',
    fi: 'fin',
    da: 'dan',
    no: 'nor',
  }
  settings['cqp_prio'] ??= ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'lemma', 'lex', 'word']
  settings['word_label'] ??= { swe: 'ord', eng: 'word' }
  settings['visible_modes'] ??= 6
  settings['has_timespan'] ??= true

  // Set default values depending on other settings last
  settings['hits_per_page_default'] ??= settings.hits_per_page_values[0]
}

export function getDefaultWithin() {
  return Object.keys(settings['default_within'] || {})[0]
}

/** An attribute's dataset options as an object */
export const normalizeDataset = (
  dataset: NonNullable<Attribute['dataset']>,
): Record<string, string> =>
  Array.isArray(dataset) ? Object.fromEntries(dataset.map((k) => [k, k])) : dataset
