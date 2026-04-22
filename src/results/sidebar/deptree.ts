/** Dependency tree visualization using the DependencyTreeJS library */
import DependencyTreeJs from "dependencytreejs/lib"
import type { SentenceSVGOptions } from "dependencytreejs/lib/SentenceSVG"
import type { KwicToken } from "@/core/kwic/kwic"
import { getDeptreeAttrMapping } from "@/core/config"
import type { Corpus } from "@/core/config/corpusConfig.types"
import type { Attribute, DeptreeAttrMap } from "@/core/config/corpusConfigRaw.types"
import { mapValues } from "lodash-es"

// DependencyTreeJS doesn't export these members separately
const { defaultSentenceSVGOptions, ReactiveSentence, SentenceSVG } = DependencyTreeJs

export type DeptreeHoverHandler = (attr: keyof DeptreeAttrMap, key: string) => void

export function getDeptreeAttributes(corpus: Corpus): Record<keyof DeptreeAttrMap, Attribute> {
  const nameMapping = getDeptreeAttrMapping(corpus)
  return mapValues(nameMapping, (name) => corpus.attributes[name])
}

/** The input sentence in CoNLL format */
export function createConll(
  tokens: KwicToken[],
  attrMap: Record<keyof DeptreeAttrMap, Attribute>,
): string {
  /** Build a token line for the CoNLL format */
  function tokenConll(token: KwicToken): string {
    const ref = token.attrs[attrMap.ref.name]
    const pos = token.attrs[attrMap.pos.name]
    const head = token.attrs[attrMap.head.name] || "0"
    const rel = token.attrs[attrMap.rel.name]
    return [ref, token.word, "_", pos, "_", "_", head, rel, "_", "_"].join("\t")
  }
  return tokens.map(tokenConll).join("\n")
}

/** Use the DependencyTreeJS lib to draw a dependency tree and attach to a `<svg>` element */
export function drawDeptree(svg: SVGElement, conll: string, onHover: DeptreeHoverHandler) {
  const sentence = new ReactiveSentence()
  sentence.fromSentenceConll(conll)

  const options: SentenceSVGOptions = {
    ...defaultSentenceSVGOptions(),
    shownFeatures: ["UPOS"],
    arcHeight: 35,
    tokenSpacing: 20,
  }

  new SentenceSVG(svg, sentence, options)

  function attachHoverHandler(selector: string, name: keyof DeptreeAttrMap) {
    for (const el of svg.querySelectorAll(selector)) {
      el.addEventListener("mouseover", () => onHover(name, el.textContent))
    }
  }
  attachHoverHandler(".UPOS", "pos")
  attachHoverHandler(".DEPREL", "rel")
}
