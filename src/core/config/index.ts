import type { InstanceConfig, WordPictureDef } from "./instanceConfig.types"
import type { Attribute, MaybeConfigurable, MaybeWithOptions } from "./corpusConfigRaw.types"
import type { Corpus, CorpusConfig } from "./corpusConfig.types"
import { isFunction } from "lodash"
import { getAllCorporaInFolders } from "../corpora/corpora"

/** A combination of frontend app settings and corpus config from backend. */
export type Config = InstanceConfig & CorpusConfig

/**
 * Settings read from app instance and later merged with corpus config from backend.
 *
 * Initially empty, must only be used after populating by awaiting `loadSettings()`.
 */
const settings: Config = {} as Config
export default settings

// Expose to browser console when developing
if (import.meta.env.DEV) window.settings = settings

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
  const name = typeof definition === "string" ? definition : definition.name
  const widget = registry[name]
  if (isFunction(widget)) {
    const options = typeof definition == "object" ? definition.options : {}
    return widget(options)
  }
  return widget
}

export const getDefaultWithin = () => Object.keys(settings["default_within"] || {})[0] || "sentence"

export const getDefaultCorpusSelection = (): string[] =>
  (settings["preselected_corpora"] || []).flatMap((name) =>
    getAllCorporaInFolders(settings["folders"], name.replace(/^__/, "")),
  )

/** Identify deptree attribute names */
export function getDeptreeAttrMapping(corpus: Corpus): Record<string, string> {
  const defaultMapping = {
    ref: "ref",
    pos: "pos",
    head: "dephead",
    rel: "deprel",
  }
  return { ...defaultMapping, ...corpus.deptree?.attrs }
}

/** Convert Word picture config to use abbreviations for POS and relation, to match the data. */
export function getWordPictureConfig(): Record<string, WordPictureDef[]> {
  // The tagset maps long labels to lower-case short codes
  const labelToCode = (label: string) => settings["word_picture_tagset"]?.[label]?.toUpperCase()
  return Object.fromEntries(
    Object.entries(settings["word_picture_conf"] || {}).map(([posLong, section]) => [
      // Convert the conf object's long POS keys
      labelToCode(posLong),
      // Convert each column's `rel` long relation label
      section.map((table) =>
        table.map((column) =>
          column == "_" ? column : { ...column, rel: labelToCode(column.rel) },
        ),
      ),
    ]),
  )
}

/** An attribute's dataset options as an object */
export const normalizeDataset = (
  dataset: NonNullable<Attribute["dataset"]>,
): Record<string, string> =>
  Array.isArray(dataset) ? Object.fromEntries(dataset.map((k) => [k, k])) : dataset

/** Get attribute name for use in CQP, prepended with `_.` if it is a structural attribute. */
export const prefixAttr = (attr: Attribute): string =>
  attr["is_struct_attr"] ? `_.${attr.name}` : attr.name
