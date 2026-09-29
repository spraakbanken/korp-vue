import { memoize, uniq } from "lodash-es"
import type { RecursiveRecord } from "./types/attrValues"
import { client, KorpBackendError } from "./common"
import type { components } from "./types/openapi-types"

/** Find which unique values occur and count them. */
export const countAttrValues: (
  corpora: string[],
  attrs: string[],
  /** Attributes whose values should be split by "|" */
  split?: string[],
) => Promise<RecursiveRecord<number>> = memoize(
  async (corpora, attrs, split = []) => {
    // Join attributes as a hierarchical path that shapes the response
    const attributePath = attrs.join(">")
    const { data, error } = await client.GET("/attribute-values", {
      params: {
        query: {
          corpora,
          attributes: [attributePath],
          include_combined: true,
          include_counts: true,
          split,
        },
      },
    })

    if (error) throw new KorpBackendError(error.title, error.detail)

    // The attribute path makes the response a nested object,
    // and `include_counts` produces objects of counts instead of arrays of values
    return data.combined![attributePath]! as components["schemas"]["AttributeValuesWithCounts"]
  },
  // Memoize based on the values of all arguments
  (...args) => JSON.stringify(args),
)

/** Find which unique values occur for a given attribute. */
export const getAttrValues: (
  corpora: string[],
  attr: string,
  /** Whether values should be split by "|" */
  split?: boolean,
  ranked?: boolean,
) => Promise<string[]> = memoize(
  async (corpora, attr, split, ranked) => {
    const { data, error } = await client.GET("/attribute-values", {
      params: {
        query: {
          corpora,
          attributes: [attr],
          include_combined: true,
          split: split ? [attr] : undefined,
        },
      },
    })

    if (error) throw new KorpBackendError(error.title, error.detail)

    // With no `include_counts` param, the response is a flat list of values
    const values = data?.combined![attr] as string[]
    // If attribute is ranked, strip ":<rank>" suffix
    if (ranked) return uniq(values.map((value) => value.replace(/:.*$/, "")))
    return values
  },
  // Memoize based on the values of all arguments
  (...args) => JSON.stringify(args),
)
