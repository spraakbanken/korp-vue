import settings from "@/core/config"
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { expandCqp } from "@/core/cqp/cqp"
import type { FrequenciesResponse, FrequencyRow, FrequencyStatistics } from "../korp-api"
import { EndpointBase } from "./EndpointBase"
import type { ClientParams } from "../client.types"
import type { WithRequired } from "@/core/util"

export type FrequenciesParams = {
  cqp: string
  attrs: string[]
  defaultWithin?: string
  ignoreCase?: boolean
}

// The include params are true by default, so we know both `combined` and `corpora` are present
export type FrequenciesData = Omit<
  WithRequired<FrequencyStatistics, "combined" | "corpora">,
  "rows"
> & {
  rows: WithRequired<FrequencyRow, "combined" | "corpora">[]
}

export class FrequenciesEndpoint extends EndpointBase<
  "/frequencies",
  FrequenciesParams,
  FrequenciesData
> {
  protected readonly path = "/frequencies"
  /** This is needed so that the statistics view will know what the original LINKED corpora was in parallel */
  originalCorpora: string[] = []
  /** Percentage of selected materials that do not support selected attributes */
  unsupportedRatio: number = 0
  /** Attributes that are not supported by all selected corpora */
  unsupportedAttributes: AttributeOption[] = []

  processParams(params: FrequenciesParams) {
    const { cqp, attrs, defaultWithin, ignoreCase } = params

    // Get selected attribute options
    const options = corpusSelection
      .getAttributeGroupsStatistics()
      .filter((option) => attrs.includes(option.name) && option.name != "word")

    // Assert that all attrs were recognized
    const missingAttrs = attrs.filter(
      (name) => !options.find((attr) => attr.name == name) && name != "word",
    )
    if (missingAttrs.length)
      throw new Error(`Trying to reduce by missing attribute ${missingAttrs}`)

    // Calculate size of selected corpora that do not support all attributes
    const unsupportedCorpora = corpusSelection.getUnsupportedCorpora(options)
    this.unsupportedRatio = unsupportedCorpora.corpora.length
      ? unsupportedCorpora.getTokenCount() / corpusSelection.getTokenCount()
      : 0

    // Get names of not-fully-supported attributes
    this.unsupportedAttributes = options.filter((option) => option.unsupported.length)

    // Use only corpora that support all attributes
    const supportedCorpora = corpusSelection
      .getIds()
      .filter((id) => !unsupportedCorpora.getIds().includes(id))
    if (!supportedCorpora.length) throw new NoSupportedCorporaError()
    const corpora = corpusSelection.pick(supportedCorpora)

    // Preserve corpora links when in parallel, for use in subsearch
    this.originalCorpora = corpora.getIds()

    const [groupByStruct, groupBy] = corpora.partitionAttrs(attrs)

    let within = corpora.getWithinParam(defaultWithin)
    // Replace "ABC-aa|ABC-bb:link" with "ABC-aa:link"
    if (settings.parallel) within = within?.map((w) => w.replace(/\|.*?:/g, ":"))

    const split = options.filter((option) => option.type == "set").map((option) => option.name)
    const suffixed = settings.group_statistics.filter((name) => attrs.includes(name))
    // For ranked attributes, only count the top-ranking value in a token.
    const top = options.filter((option) => option.ranked).map((option) => option.name)

    return Promise.resolve(<ClientParams<"/frequencies">>{
      corpora: corpora.getIds(true),
      cqp: [expandCqp(cqp)],
      group_by: groupBy,
      group_by_struct: groupByStruct,
      limit: settings["statistics_limit"] ?? 0,
      ignore_case: ignoreCase ? ["word"] : undefined,
      split: split,
      max_values_per_set: top,
      default_within: defaultWithin,
      strip_suffix: suffixed,
      within,
    })
  }

  processResponse(data: FrequenciesResponse) {
    // We only use one CQP, so take the first set of rows
    // The include params are true by default, so we know both `combined` and `corpora` are present
    return Promise.resolve(data.results[0] as FrequenciesData)
  }
}

export class NoSupportedCorporaError extends Error {
  constructor() {
    super("No selected corpus supports all chosen attributes")
    this.name = "NoSupportedCorporaError"
  }
}
