import { WordPicture, type WordType } from "@/core/wordpic"
import ProxyBase from "./ProxyBase"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { partition, sortBy } from "lodash-es"
import type { RelationsSort } from "../types/relations"
import { unregescape } from "@/core/util"
import type { RelationsTimeParams } from "../types/relationsTime"

export type PeriodWordPicture = { range: string; data: WordPicture }

export class RelationsTimeProxy extends ProxyBase<"relations_time"> {
  protected readonly endpoint = "relations_time"

  /** Returns two lists of corpora: one with those selected that support word picture time, and one with those that don't. */
  static checkCorpusSupport(): [Corpus[], Corpus[]] {
    return partition(corpusSelection.corpora, (corpus) => corpus.features?.relations_time)
  }

  buildParams(
    type: WordType,
    word: string,
    sort: RelationsSort,
    periodSize: number,
    periodAsc = false,
  ): RelationsTimeParams {
    return {
      type,
      word,
      corpus: corpusSelection.stringify(),
      incremental: true,
      sort,
      period_align: periodAsc ? "oldest" : undefined,
      period_size: periodSize,
      max: 1000,
    }
  }

  async makeRequest(
    type: WordType,
    word: string,
    sort: RelationsSort,
    periodSize: number = 10,
    periodAsc = false,
  ): Promise<PeriodWordPicture[]> {
    if (type == "lemgram") word = unregescape(word)
    const params = this.buildParams(type, word, sort, periodSize, periodAsc)
    const data = await this.send(params)

    // Sort periods
    const ranges = sortBy(Object.keys(data.relations_time), parseInt)
    if (!periodAsc) ranges.reverse()

    // Process each period's data
    return ranges.map((range) => ({
      range,
      data: new WordPicture(word, type, data.relations_time[range]),
    }))
  }
}

export class RelationsParseError extends Error {}
