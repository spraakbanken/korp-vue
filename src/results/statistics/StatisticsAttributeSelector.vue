<script setup lang="ts">
/** @file Dropdown for selecting attributes to group by in statistics */
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { useLocale } from "@/i18n/useLocale"
import { watchImmediate } from "@vueuse/core"
import { compact, groupBy, isEqual, sortBy } from "lodash-es"
import { computed, reactive, unref } from "vue"
import { corpusListing } from "@/core/corpora/corpusListing"
import { vPopover } from "@/bootstrap"
import { truncateStr } from "@/core/util"
import CaseInsensitivityToggle from "@/components/CaseInsensitivityToggle.vue"

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

/** Toggle the ignore case option for a selected attribute */
function toggleInsensitive(name: string) {
  // If case-insensitivity is being changed, the attribute should be selected
  selectedLocal.add(name)
  if (insensitiveLocal.has(name)) insensitiveLocal.delete(name)
  else insensitiveLocal.add(name)
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

function getCorpusTitles(ids: string[]) {
  return corpusListing
    .pick(ids)
    .map((corpus) => locObj(corpus.title))
    .join(", ")
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
      class="form-control form-control-sm dropdown-toggle"
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
            class="dropdown-item d-flex justify-content-between align-items-center gap-1"
            :class="{ active: selectedLocal.has(option.name) }"
            @click.prevent="toggle(option.name)"
          >
            {{ locObj(option.label) }}

            <fa-icon
              v-if="option.unsupported.length"
              icon="fa-solid fa-ban"
              size="sm"
              :class="{ 'text-warning': !selectedLocal.has(option.name) }"
              v-popover
              data-bs-toggle="popover"
              data-bs-trigger="focus hover"
              :data-bs-content="
                $t('result.statistics.unsupported_attribute', {
                  corpora: truncateStr(getCorpusTitles(option.unsupported), 200),
                })
              "
              style="cursor: default"
              @click.stop.prevent
            />

            <CaseInsensitivityToggle
              v-if="option.name == 'word'"
              @click.stop
              :modelValue="insensitiveLocal.has('word')"
              @update:modelValue="toggleInsensitive('word')"
            />
          </a>
        </li>
      </template>
    </ul>
  </div>
</template>
