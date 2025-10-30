import { keyBy, mapValues, omit, pick } from "lodash"
import { korpRequest } from "../api/common"
import currentMode from "../corpora/mode"
import { fromKeys } from "../util"
import type { InstanceConfig } from "./instanceConfig.types"
import type { CorpusConfig, Corpus } from "./corpusConfig.types"
import type {
  Attribute,
  CorpusConfigRaw,
  CorpusRaw,
  CustomAttribute,
} from "./corpusConfigRaw.types"
import type { Labeled } from "../model/locale"

type InfoData = Record<string, Pick<Corpus, "info" | "private_struct_attributes">>

export async function loadCorpusConfig(settings: InstanceConfig) {
  const config = await loadRawCorpusConfig(settings)
  const infos = await loadCorpusInfo(Object.keys(config.corpora))
  return transformConfig(config, infos)
}

/** Fetches corpus config from the backend. */
async function loadRawCorpusConfig(settings: InstanceConfig): Promise<CorpusConfigRaw> {
  // The corpora to include are normally given by the mode config, but allow defining it elsewhere (used by Mink)
  const corpusIds = settings.get_corpus_ids ? await settings.get_corpus_ids() : undefined

  const config = await korpRequest("corpus_config", {
    mode: currentMode,
    corpus: corpusIds?.join(",") || undefined,
  })

  return config
}

/** Fetches corpus info (date range etc for each corpus). */
async function loadCorpusInfo(corpusIds: string[]): Promise<InfoData> {
  if (!corpusIds.length) return {}

  const params = { corpus: corpusIds.map((id) => id.toUpperCase()).join(",") }
  const data = await korpRequest("corpus_info", params)

  return fromKeys(corpusIds, (corpusId) => ({
    info: data.corpora[corpusId.toUpperCase()].info,
    private_struct_attributes: data.corpora[corpusId.toUpperCase()].attrs.s.filter(
      (name) => name.indexOf("__") !== -1,
    ),
  }))
}

/** Transform the raw config fetched form backend, to a structure that frontend code can handle. */
export function transformConfig(config: CorpusConfigRaw, infos: InfoData): CorpusConfig {
  // take the backend configuration format for attributes and expand it
  // TODO the internal representation should be changed to a new, more compact one.
  function transformCorpus(corpus: CorpusRaw): Corpus {
    if (corpus.title == undefined) {
      corpus.title = corpus.id
    }

    function transformAttributes2<T extends Attribute | CustomAttribute>(
      attrsKey: keyof CorpusConfigRaw["attributes"],
    ): [Record<string, T>, string[]] {
      const names = corpus[attrsKey]
      const attrs = config.attributes[attrsKey] as Record<string, T>
      if (!names || !attrs) return [{}, []]
      const defs1 = pick(attrs, names)
      const defs = keyBy(defs1, "name")
      const order = names.map((name) => attrs[name].name)
      return [defs, order]
    }

    const [attributes, _attributes_order] = transformAttributes2("pos_attributes")
    const [struct_attributes, _struct_attributes_order] = transformAttributes2("struct_attributes")
    const [custom_attributes, _custom_attributes_order] =
      transformAttributes2<CustomAttribute>("custom_attributes")

    return {
      ...omit(corpus, "pos_attributes"),
      attributes,
      struct_attributes,
      custom_attributes,
      _attributes_order,
      _struct_attributes_order,
      _custom_attributes_order,
      context: contextWithinFix(corpus["context"]),
      within: contextWithinFix(corpus["within"]),
      info: infos[corpus.id].info,
      private_struct_attributes: infos[corpus.id].private_struct_attributes,
    }
  }

  // TODO use the new format instead
  // remake the new format of witihns and contex to the old
  function contextWithinFix(list: Labeled[]) {
    // sort the list so that sentence is before paragraph
    const sortingArr = ["sentence", "paragraph", "text", "1 sentence", "1 paragraph", "1 text"]
    list.sort((a, b) => sortingArr.indexOf(a.value) - sortingArr.indexOf(b.value))
    return Object.fromEntries(list.map((elem) => [elem.value, elem.value]))
  }

  const modes = config.modes.map((mode) => ({ ...mode, selected: mode.mode == currentMode }))

  return {
    folders: {},
    ...omit(config, "pos_attributes", "corpora"),
    corpora: mapValues(config.corpora, transformCorpus),
    modes,
    mode: modes.find((mode) => mode.selected)!,
  }
}
