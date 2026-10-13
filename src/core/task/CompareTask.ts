import { groupBy, mapValues, pick, range, sumBy, uniq, zip } from "lodash-es"
import type { Attribute } from "../config/corpusConfigRaw.types"
import { corpusListing } from "../corpora/corpusListing"
import { CorpusSet } from "../corpora/CorpusSet"
import { TaskBase } from "./TaskBase"
import { ExampleTask } from "./ExampleTask"
import settings, { prefixAttr } from "../config"
import { backendStream } from "../backend/client"
import { splitSuffix } from "../util"

export type SavedSearch = {
  label: string
  cqp: string
  corpora: string[]
}

export type CompareResult = {
  tables: CompareTables
  max: number
}

export type CompareTables = { positive: CompareItem[]; negative: CompareItem[] }

export type CompareItem = {
  /** Value of given attribute without probability suffixes */
  key: string
  /** Log-likelihood value */
  loglike: number
  /** Absolute frequency */
  abs: number
  /** Values of given attribute, as found including probability suffixes */
  elems: Record<string, string[]>[]
  /** Values simplified for grouping */
  values: Record<string, string[]>
}

export class CompareTask extends TaskBase<CompareResult> {
  attributes: Record<string, Attribute>
  cl: CorpusSet
  reduce: string[]

  constructor(
    public cmp1: SavedSearch,
    public cmp2: SavedSearch,
    reduce: string[],
  ) {
    super()
    this.cl = corpusListing.pick([...cmp1.corpora, ...cmp2.corpora])
    this.reduce = reduce.map((item) => item.replace(/^_\./, ""))
    this.attributes = pick(this.cl.getReduceAttrs(), this.reduce)
  }

  async send(): Promise<CompareResult> {
    // remove all corpora which do not include all the "reduce"-attributes
    const corpora1 = this.cmp1.corpora.filter((corpus) =>
      this.cl.corpusHasAttrs(corpus, this.reduce),
    )
    const corpora2 = this.cmp2.corpora.filter((corpus) =>
      this.cl.corpusHasAttrs(corpus, this.reduce),
    )

    const [reduceStruct, reducePos] = this.cl.partitionAttrs(this.reduce)

    const split = this.reduce.filter((r) => this.attributes[r]?.type === "set")

    const rankedReduce = this.reduce.filter((item) => this.cl.getAttributes()[item]?.ranked)

    const data = await backendStream("/log-likelihood", {
      group_by: reducePos,
      group_by_struct: reduceStruct,
      set1_corpora: corpora1,
      set1_cqp: this.cmp1.cqp,
      set2_corpora: corpora2,
      set2_cqp: this.cmp2.cqp,
      max_results: 50,
      max_values_per_set: rankedReduce,
      split,
    })

    type ItemRaw = (typeof data.results)[0]
    type Polarity = "positive" | "negative"

    const tables = groupBy(data.results, (item) =>
      item.score > 0 ? "positive" : "negative",
    ) as Record<Polarity, ItemRaw[]>

    let max = 0
    const groupAndSum = (table: ItemRaw[]): CompareItem[] => {
      // Simplify values and group by them
      type CompareItemGroup = { values: CompareItem["values"]; items: ItemRaw[] }
      const itemsGrouped = table.reduce(
        (acc: Record<string, CompareItemGroup>, item) => {
          const value = mapValues(item.value, (values, attr) =>
            settings.group_statistics.includes(attr)
              ? values.map((value) => splitSuffix(value)[0])
              : values,
          )
          const key = Object.values(value).flat().join()
          acc[key] ??= { values: value, items: [] }
          acc[key].items.push(item)
          return acc
        },
        {} as Record<string, CompareItemGroup>,
      )

      const res = Object.entries(itemsGrouped).map(([key, { values, items }]): CompareItem => {
        // Add up similar items.
        // TODO Really sum loglike scores?
        const loglike = sumBy(items, "score")
        const abs = sumBy(items, items[0].score < 0 ? "set1" : "set2")
        const elems = items.map((item) => item.value)
        max = Math.max(max, Math.abs(loglike))
        return { key, loglike, abs, elems, values }
      })
      return res.sort((a, b) => Math.abs(b.loglike) - Math.abs(a.loglike))
    }

    const positive = groupAndSum(tables.positive)
    const negative = groupAndSum(tables.negative)

    return {
      tables: { positive, negative },
      max,
    }
  }

  createExampleTask(cmpI: number, row: CompareItem): ExampleTask {
    const itemCqp = this.buildItemCqp(row)
    const cmp = [this.cmp1, this.cmp2][cmpI]
    return new ExampleTask(cmp.corpora, [cmp.cqp, itemCqp])
  }

  buildItemCqp(row: CompareItem) {
    // number of tokens in search
    const tokenLength = Math.max(...Object.values(row.elems[0]).flatMap((tokens) => tokens.length))

    const cqps = range(0, tokenLength).map((tokenIdx) => {
      const token = this.reduce.map((attr) => uniq(row.elems.map((res) => res[attr][tokenIdx])))
      const cqpAnd = this.reduce.map((name, attrI) => {
        const attrVal = token[attrI]
        const attribute = this.attributes[name]
        const type = attribute.type

        const op = type === "set" ? "contains" : "="

        let val: string
        if (type === "set" && attrVal.length > 1) {
          // Assemble variants for each position in the token
          const transpose = <T>(matrix: T[][]) => zip(...matrix) as T[][]
          const variantsByValue = attrVal.map((val) => val.split(":").slice(1))
          const variantsByPosition = transpose(variantsByValue).map(uniq)
          const variantsStrs = variantsByPosition.map((variants) => `:(${variants.join("|")})`)
          const key = attrVal[0].split(":")[0]
          val = key + variantsStrs.join("")
        } else {
          val = attrVal[0]
        }

        const isEmptySet = type === "set" && (val === "|" || val === "")
        const cqpName = prefixAttr(attribute)
        return isEmptySet ? `ambiguity(${cqpName}) = 0` : `${cqpName} ${op} "${val}"`
      })

      return `[${cqpAnd.join(" & ")}]`
    })

    return `<match> ${cqps.join(" ")} []{0,} </match>`
  }
}
