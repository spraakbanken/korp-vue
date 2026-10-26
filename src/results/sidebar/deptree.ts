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

export type DeptreeHoverHandler = (attr: Attribute, key: string) => void

/** Use the DependencyTreeJS lib to draw a dependency tree and attach to a `<svg>` element */
export function drawDeptree(
  svg: SVGElement,
  corpus: Corpus,
  tokens: KwicToken[],
  onHover: DeptreeHoverHandler,
) {
  const nameMapping = getDeptreeAttrMapping(corpus)
  const attrMap = mapValues(nameMapping, (name) => corpus.attributes[name])

  // Get values of configured dependency attributes
  const items = tokens.map((token) => {
    // The lib chokes on 0-padded string, so parse it as a number
    const ref = String(Number(token.attrs[attrMap.ref.name]))
    const pos = token.attrs[attrMap.pos.name]
    const head = token.attrs[attrMap.head.name] || "0"
    const rel = token.attrs[attrMap.rel.name]
    return { ref, pos, head, rel, token }
  })

  // Format sentence as CoNLL-U
  const lines = items.map(({ ref, pos, head, rel, token }) =>
    [ref, token.word, "_", pos, "_", "_", head, rel, "_", "_"].join("\t"),
  )
  const conll = lines.join("\n")

  // Create sentence model from the CoNLL-U representation
  const sentence = new ReactiveSentence()
  sentence.fromSentenceConll(conll)

  // Get matched refs
  const matches = items.filter((item) => item.token._match).map((item) => item.ref)

  // Draw SVG
  const options: SentenceSVGOptions = {
    ...defaultSentenceSVGOptions(),
    shownFeatures: ["UPOS"],
    arcHeight: 35,
    tokenSpacing: 20,
    matches,
  }
  new SentenceSVG(svg, sentence, options)

  function attachHoverHandler(selector: string, name: keyof DeptreeAttrMap) {
    for (const el of svg.querySelectorAll(selector)) {
      el.addEventListener("mouseover", () => onHover(attrMap[name], el.textContent))
    }
  }
  attachHoverHandler(".UPOS", "pos")
  attachHoverHandler(".DEPREL", "rel")
}
