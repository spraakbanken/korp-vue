<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { useLocale } from "@/i18n/useLocale"
import { watchImmediate } from "@vueuse/core"
import { cloneDeep, compact, groupBy, isEqual, sortBy } from "lodash"
import { computed, onMounted, ref, unref, useTemplateRef } from "vue"

export type StatisticsAttributeSelectorModel = {
  selected: string[]
  insensitive: string[]
}

const model = defineModel<StatisticsAttributeSelectorModel>({ required: true })

const { locObj } = useLocale()

const dropdown = useTemplateRef("dropdown")
const attributes = ref(corpusSelection.getAttributeGroupsStatistics())
const optionsGrouped = computed(
  () => groupBy(attributes.value, "group") as Record<AttributeOption["group"], AttributeOption[]>,
)
const selectedLocal = ref<string[]>([...model.value.selected])
const insensitiveLocal = ref<string[]>([...model.value.insensitive])

const selectedAttributes = computed(() =>
  compact(
    model.value.selected.map((name) => attributes.value.find((option) => option.name === name)),
  ),
)

// Update available attributes when corpus selection changes
corpusSelection.listen(() => {
  attributes.value = corpusSelection.getAttributeGroupsStatistics()
})

// Validate and update selection against incoming changes
watchImmediate([model, attributes], () => {
  // Remove non-available attributes
  const selected = model.value.selected.filter((name) =>
    attributes.value.some((attr) => attr.name == name),
  )
  commit(selected, insensitiveLocal.value)
})

/** Add a selected attribute option to the selection model */
function toggle(name: string) {
  const index = selectedLocal.value.indexOf(name)
  if (index >= 0) selectedLocal.value.splice(index, 1)
  else selectedLocal.value.push(name)

  // Re-sort selected attributes to match options order
  selectedLocal.value = sortBy(selectedLocal.value, (name) =>
    attributes.value.findIndex((attr) => attr.name === name),
  )
}

onMounted(() => {
  // When menu is closed, commit local selection to model
  dropdown.value!.addEventListener("hidden.bs.dropdown", () => {
    commit(selectedLocal.value, insensitiveLocal.value)
  })
})

function commit(selected: string[], insensitive: string[]) {
  // If none selected, default to word.
  if (!selected.length) selected.push("word")
  // Remove insensitive selections that are no longer selected
  insensitive = insensitive.filter((name) => selected.includes(name))

  selectedLocal.value = [...selected]
  insensitiveLocal.value = [...insensitive]
  const value = cloneDeep({ selected, insensitive })
  if (!isEqual(value, unref(model))) model.value = value
}
</script>

<template>
  <div class="dropdown" ref="dropdown">
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
            :class="{ active: selectedLocal.includes(option.name) }"
            @click.prevent="toggle(option.name)"
          >
            {{ locObj(option.label) }}
          </a>
        </li>
      </template>
    </ul>
  </div>
</template>
