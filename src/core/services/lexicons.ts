import * as karp from "@/core/services/karp"
import { backendQuery } from "../backend/client"

export type LemgramCount = { lemgram: string; count: number }

export type SenseResult = { sense: string; desc: string }

/** Look up lemgrams matching a given wordform and count them in selected corpora. */
export async function getLemgrams(
  wf: string,
  resources: string[],
  corpora: string[],
  count = false,
): Promise<LemgramCount[]> {
  // If no morphology specified, default to SALDO
  if (resources.length == 0) resources = ["saldom"]
  const lemgrams = (await karp.getLemgrams(wf, resources)).hits
  if (lemgrams.length == 0) return []

  if (!count) return lemgrams.map((lemgram) => ({ lemgram, count: -1 }))

  const data = await backendQuery("/lexeme-counts", { lexemes: lemgrams, corpora })

  return lemgrams.map((lemgram) => ({ lemgram, count: data.lexeme_counts[lemgram] || 0 }))
}

/** Look up SALDO senses of lemgrams of a given wordform. */
export async function getSenses(wf: string): Promise<SenseResult[]> {
  const lemgrams = (await karp.getLemgrams(wf, ["saldom"])).hits
  if (lemgrams.length == 0) return []

  const senses = (await karp.getSenses(lemgrams)).hits
  return senses.map(({ senseID, primary }) => ({ sense: senseID, desc: primary }))
}
