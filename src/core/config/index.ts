/** @format */
import type { AppSettings } from './app-config.types'
import type { Config } from './config.types'

/** A combination of frontend app settings and corpus config from backend. */
// TODO ConfigTransformed
export type Settings = AppSettings & Config

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

  // 3. Fetch config
  const url = new URL(`${appSettings.korp_backend_url}/corpus_config`)
  const mode = new URLSearchParams(location.search).get('mode') || 'default'
  url.searchParams.append('mode', mode)
  const config: Config = await (await fetch(url)).json()

  // 4. Fetch info

  // 6. Transform config+info

  // 7. Merge config
  const merged = { ...appSettings, ...config } as Settings

  // 8. Set global
  Object.assign(settings, merged)
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
