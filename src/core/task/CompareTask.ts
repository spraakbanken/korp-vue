import { partition, pick } from "lodash-es"
import type { Attribute } from "../config/corpusConfigRaw.types"
import { corpusListing } from "../corpora/corpusListing"
import { CorpusSet } from "../corpora/CorpusSet"
import { TaskBase } from "./TaskBase"
import { ExampleTask } from "./ExampleTask"
import settings from "../config"
import { backendStream } from "../backend/client"
import type { LogLikelihoodRow } from "../backend/korp-api"
import { getCqp, valuesByToken } from "../statistics/statistics"

export type SavedSearch = {
  label: string
  cqp: string
  corpora: string[]
}

export type CompareResult = {
  max: number
  negative: LogLikelihoodRow[]
  positive: LogLikelihoodRow[]
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
    const suffixed = settings.group_statistics.filter((name) => this.reduce.includes(name))
    const rankedReduce = this.reduce.filter((item) => this.cl.getAttributes()[item]?.ranked)

    const data = await backendStream("/log-likelihood", {
      group_by: reducePos,
      group_by_struct: reduceStruct,
      set1_corpora: corpora1,
      set1_cqp: this.cmp1.cqp,
      set2_corpora: corpora2,
      set2_cqp: this.cmp2.cqp,
      max_results: 1000,
      max_values_per_set: rankedReduce,
      split,
      strip_suffix: suffixed,
    })

    // Calculate max score for drawing bars
    const max = data.results.reduce((max, item) => Math.max(max, Math.abs(item.score)), 0)

    // Sort into two columns
    const [negative, positive] = partition(data.results, (item) => item.score < 0)
    return { max, negative, positive }
  }

  createExampleTask(row: LogLikelihoodRow): ExampleTask {
    const itemCqp = getCqp(valuesByToken(row.value))
    const cmp = row.score < 0 ? this.cmp1 : this.cmp2
    return new ExampleTask(cmp.corpora, [cmp.cqp, itemCqp])
  }

  createCsv(result: CompareResult): (string | number)[][] {
    const metadata = [
      "Log-likelihood comparison between two frequency searches",
      "Search query 1 (negative loglike):",
      `- Corpora: ${this.cmp1.corpora.join(", ")}`,
      `- CQP: ${this.cmp1.cqp}`,
      "Search query 2 (positive loglike):",
      `- Corpora: ${this.cmp2.corpora.join(", ")}`,
      `- CQP: ${this.cmp2.cqp}`,
    ].map((line) => [`## ${line}`])

    const rows = [...result.positive, ...result.negative].sort((a, b) => b.score - a.score)
    const header = [...this.reduce, "loglike", "frequency 1", "frequency 2"]

    const data = rows.map((row) => {
      const values = this.reduce.map((attr) => row.value[attr].join(" "))
      return [...values, row.score, row.set1, row.set2]
    })

    return [...metadata, header, ...data]
  }
}
