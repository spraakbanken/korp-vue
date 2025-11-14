import appSettings from "@instance/settings"
import type { InstanceConfig } from "./instanceConfig.types"

/**
 * Sets defaults, validates and normalizes some settings.
 */
export function getInstanceConfig(): InstanceConfig {
  const settings = { ...appSettings }
  settings["hits_per_page_values"] ??= [25, 50, 75, 100]
  settings["group_statistics"] ??= []
  // The default maximum URI length for Apache is 8190 but keep
  // some safety margin
  settings["backendURLMaxLength"] ??= 8100
  settings["default_language"] ??= "eng"
  settings["default_options"] ??= { is: "=", is_not: "!=" }
  // codes for translation ISO-639-1 to 639-2
  settings["iso_languages"] ??= {
    en: "eng",
    sv: "swe",
    fi: "fin",
    da: "dan",
    no: "nor",
  }
  settings["cqp_prio"] ??= ["deprel", "pos", "msd", "suffix", "prefix", "lemma", "lex", "word"]
  settings["word_label"] ??= { swe: "ord", eng: "word" }
  settings["visible_modes"] ??= 6
  settings["has_timespan"] ??= true

  // Set default values depending on other settings last
  settings["hits_per_page_default"] ??= settings.hits_per_page_values[0]!

  settings.korp_backend_url = settings.korp_backend_url.trim().replace(/\/$/, "")
  if (!settings.korp_backend_url.startsWith("http")) {
    throw new Error('Setting "korp_backend_url" must start with http(s)')
  }

  return settings
}
