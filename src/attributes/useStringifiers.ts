import type { Stringifier } from "./attributes.types"
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

  return getStringifier
}
