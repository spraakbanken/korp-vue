import type { CqpStringifier, ListStringifier, Stringifier } from "./attributes.types"
import { inject } from "vue"
import { injectionKeys } from "@/injection"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { stringifyValue } from "@/core/corpora/attribute"

/**
 * Get a stringifier for the given attribute config.
 *
 * Custom stringifiers can be added using `provide`. For the sidebar, advanced output can be implemented as a formatter component instead.
 */
export function useStringifiers() {
  /** Custom stringifiers possibly provided by instance plugin */
  const customStringifiers = inject(injectionKeys.attribute.stringifiers, {})
  /** Custom list stringifiers possibly provided by instance plugin */
  const customListStringifiers = inject(injectionKeys.attribute.listStringifiers, {})
  /** Custom CQP stringifiers possibly provided by instance plugin */
  const customCqpStringifiers = inject(injectionKeys.attribute.cqpStringifiers, {})

  /** Get default or custom stringifier for the given attribute */
  function getStringifier(attribute: Attribute): Stringifier {
    // Use custom stringifier if configured for this attribute
    if (attribute.stringify) {
      if (customStringifiers[attribute.stringify]) return customStringifiers[attribute.stringify]
      else
        console.warn(
          `Custom stringifier ${attribute.stringify} not found for attribute ${attribute.name}`,
        )
    }
    // Otherwise use default stringifier
    return getDefaultStringifier(attribute)
  }

  /** Handles a few standard attribute stringification cases */
  function getDefaultStringifier(attribute: Attribute): Stringifier {
    const { ranked, translation } = attribute
    return (str) => stringifyValue(str, ranked, translation)
  }

  /** Get optional custom list stringifier (for a sequence of tokens) for the given attribute */
  function getListStringifier(attribute: Attribute): ListStringifier | undefined {
    return customListStringifiers[attribute.stats_stringify || ""]
  }

  /** Get optional custom CQP stringifier for the given attribute */
  function getCqpStringifier(attribute: Attribute): CqpStringifier | undefined {
    return customCqpStringifiers[attribute.stats_cqp || ""]
  }

  return {
    getStringifier,
    getListStringifier,
    getCqpStringifier,
  }
}
