<script setup lang="ts">
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { useLocale } from "@/i18n/useLocale"
import { watchImmediate } from "@vueuse/core"
import { compact, groupBy, isEqual, sortBy } from "lodash"
import { computed, reactive, unref } from "vue"

export type StatisticsAttributeSelectorModel = {
  selected: string[]
  insensitive: string[]
}

const model = defineModel<StatisticsAttributeSelectorModel>({ required: true })

const corpusSelection = useReactiveCorpusSelection()
const { locObj } = useLocale()

const attributes = computed(() => corpusSelection.getAttributeGroupsStatistics())
const optionsGrouped = computed(
  () => groupBy(attributes.value, "group") as Record<AttributeOption["group"], AttributeOption[]>,
)
const selectedLocal = reactive(new Set<string>(...model.value.selected))
const insensitiveLocal = reactive(new Set<string>(...model.value.insensitive))

const selectedAttributes = computed(() =>
  compact(
    model.value.selected.map((name) => attributes.value.find((option) => option.name === name)),
  ),
)

// Validate and update selection against incoming changes
watchImmediate([model, attributes], () => {
  // Remove non-available attributes
  const selected = new Set(
    model.value.selected.filter((name) => attributes.value.some((attr) => attr.name == name)),
  )
  commit(selected, insensitiveLocal)
})

/** Add a selected attribute option to the selection model */
function toggle(name: string) {
  if (selectedLocal.has(name)) selectedLocal.delete(name)
  else selectedLocal.add(name)
}

function commit(selected: Set<string>, insensitive: Set<string>) {
  // Clone arguments to avoid mutating them
  selected = new Set(selected)
  insensitive = new Set(insensitive)

  // If none selected, default to word.
  if (!selected.size) selected.add("word")
  // Remove insensitive selections that are no longer selected
  insensitive = new Set([...insensitive].filter((name) => selected.has(name)))

  // Update local reactive sets
  selectedLocal.clear()
  for (const name of selected) selectedLocal.add(name)
  insensitiveLocal.clear()
  for (const name of insensitive) insensitiveLocal.add(name)

  const value = {
    selected: sortNames([...selected]),
    insensitive: sortNames([...insensitive]),
  }
  // Only update model value if changed
  if (!isEqual(value, unref(model))) model.value = value
}

// Sort attribute names to match options as shown
function sortNames(names: string[]) {
  return sortBy(names, (name) => attributes.value.findIndex((attr) => attr.name === name))
}
</script>

<template>
  <div
    class="dropdown"
    v-on="{
      // Commit selection when dropdown is closed
      'hidden.bs.dropdown': () => commit(selectedLocal, insensitiveLocal),
    }"
  >
    <button
      class="btn btn-sm btn-secondary dropdown-toggle"
      type="button"
      id="statistics-attribute-selector-dropdown"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <span
        class="d-inline-block align-bottom overflow-hidden text-truncate"
        style="max-width: 15em"
      >
        {{ selectedAttributes.map((attr) => locObj(attr.label)).join(", ") }}
      </span>
    </button>

    <ul class="dropdown-menu" aria-labelledby="statistics-attribute-selector-dropdown">
      <template v-for="(options, type) in optionsGrouped" :key="type">
        <template v-if="type !== 'word'">
          <li @click.prevent><hr class="dropdown-divider" /></li>
          <li @click.prevent>
            <h6 class="dropdown-header">{{ $t(`attribute_type.${type}`) }}</h6>
          </li>
        </template>
        <li v-for="option in options" :key="option.name">
          <a
            href="#"
            class="dropdown-item d-flex justify-content-between align-items-baseline"
            :class="{ active: selectedLocal.has(option.name) }"
            @click.prevent="toggle(option.name)"
          >
            {{ locObj(option.label) }}
          </a>
        </li>
      </template>
    </ul>
  </div>
</template>
