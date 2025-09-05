import { getInstanceConfig } from './instanceConfig'
import { loadCorpusConfig } from './corpusConfig'
import settings from '.'

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
