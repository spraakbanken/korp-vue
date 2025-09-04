import { keyBy, mapValues, omit, pick } from 'lodash'
import type { ConfigTransformed, CorpusTransformed } from './config-transformed.types'
import type { Attribute, Config, Corpus, CustomAttribute } from './config.types'
import type { Labeled } from '../model/locale'
import currentMode from '../corpora/mode'

export type InfoData = Record<string, Pick<CorpusTransformed, 'info' | 'private_struct_attributes'>>

/** Transform the raw config fetched form backend, to a structure that frontend code can handle. */
export function transformConfig(config: Config, infos: InfoData): ConfigTransformed {
  // take the backend configuration format for attributes and expand it
  // TODO the internal representation should be changed to a new, more compact one.
  function transformCorpus(corpus: Corpus): CorpusTransformed {
    if (corpus.title == undefined) {
      corpus.title = corpus.id
    }

    function transformAttributes2<T extends Attribute | CustomAttribute>(
      attrsKey: keyof Config['attributes'],
    ): [Record<string, T>, string[]] {
      const names = corpus[attrsKey]
      const attrs = config.attributes[attrsKey] as Record<string, T>
      if (!names || !attrs) return [{}, []]
      const defs1 = pick(attrs, names)
      const defs = keyBy(defs1, 'name')
      const order = names.map((name) => attrs[name].name)
      return [defs, order]
    }

    const [attributes, _attributes_order] = transformAttributes2('pos_attributes')
    const [struct_attributes, _struct_attributes_order] = transformAttributes2('struct_attributes')
    const [custom_attributes, _custom_attributes_order] =
      transformAttributes2<CustomAttribute>('custom_attributes')

    return {
      ...omit(corpus, 'pos_attributes'),
      attributes,
      struct_attributes,
      custom_attributes,
      _attributes_order,
      _struct_attributes_order,
      _custom_attributes_order,
      context: contextWithinFix(corpus['context']),
      within: contextWithinFix(corpus['within']),
      info: infos[corpus.id].info,
      private_struct_attributes: infos[corpus.id].private_struct_attributes,
    }
  }

  // TODO use the new format instead
  // remake the new format of witihns and contex to the old
  function contextWithinFix(list: Labeled[]) {
    // sort the list so that sentence is before paragraph
    const sortingArr = ['sentence', 'paragraph', 'text', '1 sentence', '1 paragraph', '1 text']
    list.sort((a, b) => sortingArr.indexOf(a.value) - sortingArr.indexOf(b.value))
    return Object.fromEntries(list.map((elem) => [elem.value, elem.value]))
  }

  const modes = config.modes.map((mode) => ({ ...mode, selected: mode.mode == currentMode }))

  return {
    folders: {},
    ...omit(config, 'pos_attributes', 'corpora'),
    corpora: mapValues(config.corpora, transformCorpus),
    modes,
    mode: modes.find((mode) => mode.selected)!,
  }
}
