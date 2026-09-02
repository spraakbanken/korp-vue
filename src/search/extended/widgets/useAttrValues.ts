import { getAttrValues } from "@/core/backend/attrValues"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { locObj } from "@/core/i18n"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { watchImmediate } from "@vueuse/core"
import { uniq } from "lodash-es"
import { ref } from "vue"
import { useI18n } from "vue-i18n"

/** Async list of available values for a given attribute */
export default function useAttrValues(getAttribute: () => Attribute) {
  const { locale } = useI18n()
  const corpusSelection = useReactiveCorpusSelection()

  /** Options for use in a select input, each item is `[raw, translated]` */
  const options = ref<[string, string][]>([])
  const loading = ref(false)

  /** Load values from the backend */
  async function loadValues(attribute: Attribute) {
    const name = attribute.name
    const split = attribute.type == "set"
    const ranked = attribute.ranked

    // check which corpora support attributes
    const corpora = corpusSelection.corpora
      .filter((corpus) => name in corpus.struct_attributes || name in corpus.attributes)
      .map((corpus) => corpus.id)

    if (!corpora.length) return []
    return getAttrValues(corpora, name, split, ranked)
  }

  /** Translate each value using attribute config */
  function formatOptions(attribute: Attribute, values: string[]) {
    const getLabel = (value: string) =>
      locObj(attribute.translation?.[value] || value, locale.value)

    return uniq(values)
      .map((value) => [value, getLabel(value)] as [string, string])
      .sort((a, b) => a[1].localeCompare(b[1], locale.value))
  }

  watchImmediate([corpusSelection, getAttribute, locale], async () => {
    const attribute = getAttribute()

    // Load values from backend
    loading.value = true
    const values = await loadValues(attribute)
    loading.value = false

    // Format options list
    options.value = formatOptions(attribute, values)
  })

  return { options, loading }
}
