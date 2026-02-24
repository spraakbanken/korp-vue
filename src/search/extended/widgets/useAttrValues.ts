import { getAttrValues } from "@/core/backend/attrValues"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { locObj } from "@/core/i18n"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { watchImmediate } from "@vueuse/core"
import { uniq } from "lodash-es"
import { ref, type Ref } from "vue"
import { useI18n } from "vue-i18n"

export default function useAttrValues(getAttribute: () => Attribute, model: Ref<string>) {
  const { locale } = useI18n()
  const corpusSelection = useReactiveCorpusSelection()

  const options = ref<[string, string][]>([])
  const loading = ref(false)

  async function loadValues(attribute: Attribute) {
    const name = attribute.name
    const split = attribute.type == "set"

    // check which corpora support attributes
    const corpora = corpusSelection.corpora
      .filter((corpus) => name in corpus.struct_attributes || name in corpus.attributes)
      .map((corpus) => corpus.id)

    if (!corpora.length) return []
    return getAttrValues(corpora, name, split)
  }

  function formatOptions(attribute: Attribute, values: string[]) {
    const getLabel = (value: string) =>
      locObj(attribute.translation?.[value] || value, locale.value)

    return uniq(values)
      .map((value) => [value, getLabel(value)] as [string, string])
      .sort((a, b) => a[1].localeCompare(b[1], locale.value))
  }

  watchImmediate([corpusSelection, getAttribute, locale], async () => {
    const attribute = getAttribute()
    // Temporarily empty the selection to show the loading label
    const prevValue = model.value
    model.value = ""

    // Load values from backend
    loading.value = true
    const values = await loadValues(attribute)
    loading.value = false

    // Format options list
    options.value = formatOptions(attribute, values)

    // Restore or reset selection
    model.value = values.includes(prevValue) ? prevValue : options.value[0]?.[0] || ""
  })

  return { loadValues, formatOptions, options, loading }
}
