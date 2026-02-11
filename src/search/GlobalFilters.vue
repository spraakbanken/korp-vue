<script setup lang="ts">
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { useAppStore } from "@/store/useAppStore"
import { watchDeep, watchImmediate, watchOnce } from "@vueuse/core"
import { isEqual } from "lodash-es"
import { storeToRefs } from "pinia"
import { computed, watch } from "vue"
import GlobalFilterSelector from "./GlobalFilterSelector.vue"
import { useReactiveFilterManager } from "./useReactiveFilterManager"

const store = useAppStore()
const corpusSelection = useReactiveCorpusSelection()

const { global_filter } = storeToRefs(store)
const filterManager = useReactiveFilterManager()
const isEnabled = computed(() => Object.keys(filterManager.filters).length > 0)
const selection = computed(() => filterManager.getSelection())

// Whenever corpus selection is changed, update available filters.
watch(corpusSelection, () => filterManager.update(corpusSelection.getDefaultFilters()))

// When initial corpus selection has settled, start syncing filter values from URL.
watchOnce(corpusSelection, () =>
  watchImmediate(global_filter, () => filterManager.setSelection(global_filter.value)),
)

// Update URL whenever filter values are changed
watchDeep(selection, () => {
  if (!isEqual(global_filter.value, selection.value)) global_filter.value = selection.value
})
</script>

<template>
  <div v-if="isEnabled" class="d-flex gap-2 align-items-baseline">
    <span class="fw-bold">{{ $t("search.filters") }}:</span>
    <div v-for="filter in filterManager.filters" :key="filter.attribute.name">
      <GlobalFilterSelector
        v-model="filter.value"
        :label="filter.attribute.label"
        :options="filter.options"
        @update:model-value="filterManager.updateOptions()"
      />
    </div>
  </div>
</template>
