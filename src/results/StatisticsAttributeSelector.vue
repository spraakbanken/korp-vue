<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import { useLocale } from "@/i18n/useLocale"
import { compact, groupBy, isEqual } from "lodash"
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

corpusSelection.listen(() => {
  attributes.value = corpusSelection.getAttributeGroupsStatistics()

  // Remove any selected attributes that are no longer available
  const availableNames = attributes.value.map((attr) => attr.name)
  const { selected } = model.value
  const newSelected = selected.filter((name) => availableNames.includes(name))
  if (newSelected.length !== selected.length) {
    model.value = { ...model.value, selected: newSelected }
  }
})

/** Add a selected attribute option to the selection model */
function select(name: string) {
  const index = selectedLocal.value.indexOf(name)
  if (index >= 0) selectedLocal.value.splice(index, 1)
  else selectedLocal.value.push(name)
}

onMounted(() => {
  // When menu is closed, commit local selection to model
  dropdown.value!.addEventListener("hidden.bs.dropdown", () => {
    const value = { selected: selectedLocal.value, insensitive: insensitiveLocal.value }
    if (!isEqual(value, unref(model))) model.value = value
  })
})
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
          <li><hr class="dropdown-divider" /></li>
          <li>
            <h6 class="dropdown-header">{{ $t(`attribute_type.${type}`) }}</h6>
          </li>
        </template>
        <li v-for="option in options" :key="option.name">
          <a
            href="#"
            class="dropdown-item d-flex justify-content-between align-items-baseline"
            :class="{ active: selectedLocal.includes(option.name) }"
            @click.prevent="select(option.name)"
          >
            {{ locObj(option.label) }}
          </a>
        </li>
      </template>
    </ul>
  </div>
</template>
