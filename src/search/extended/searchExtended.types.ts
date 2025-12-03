import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import type { OperatorKorp } from "@/core/cqp/cqp.types"

export type SearchToken = {
  attr: Attribute
  operator: OperatorKorp
  value: string
}
