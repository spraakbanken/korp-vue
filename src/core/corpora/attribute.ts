import { escape } from "lodash-es"
import { prefixAttr } from "../config"
import type { Attribute } from "../config/corpusConfigRaw.types"
import type { Condition } from "../cqp/cqp.types"
import { compareLabels, locObj } from "../i18n"
import type { LangString, LocMap } from "../model/locale"
import { regescape } from "../util"

/** Get the dataset options of an attribute. */
export function getDatasetOptions(
  attribute: Attribute,
  lang?: string,
  sort?: boolean,
): [string, string][] {
  const dataset = attribute.dataset ?? []
  const translation = attribute.translation || {}
  // The `dataset` can be either an array of values or an object mapping values to translation keys
  const options: [string, string][] = Array.isArray(dataset)
    ? dataset.map((item) => [item, locObj(translation[item], lang)])
    : Object.entries(dataset).map(([k, v]) => [k, locObj(translation[v], lang)])
  return sort ? options.sort(compareLabels((option) => option[1])) : options
}

export function createAttrCondition(attr: Attribute, val = ""): Condition {
  return {
    type: prefixAttr(attr),
    op: attr.type == "set" ? "contains" : "=",
    val: regescape(val),
  }
}

/** Default attribute value stringifier */
export function stringifyValue(str: string, ranked = false, translation?: LocMap<LangString>) {
  // Escape characters in raw value that could break HTML, like "<" and "&"
  str = escape(str)
  // For ranked attributes, remove the ":<score>" suffix
  if (ranked) str = str.replace(/:.*/, "")
  // If there is a translation table, look up the value there
  if (translation) str = locObj(translation[str])
  return str
}

/** Join with spaces and then squash redundant and surrounding space */
export const joinWords = (words: string[]) => words.join(" ").trim().replace(/\s+/g, " ")
