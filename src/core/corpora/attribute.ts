import { prefixAttr } from "../config"
import type { Attribute } from "../config/corpusConfigRaw.types"
import type { Condition } from "../cqp/cqp.types"
import { locObj } from "../i18n"
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
  return sort ? options.sort((a, b) => a[1].localeCompare(b[1], lang)) : options
}

export function createAttrCondition(attr: Attribute, val = ""): Condition {
  return {
    type: prefixAttr(attr),
    op: attr.type == "set" ? "contains" : "=",
    val: regescape(val),
  }
}
