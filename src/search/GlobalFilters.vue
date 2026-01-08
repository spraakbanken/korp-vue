<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { isEqual, once } from "lodash"
import { storeToRefs } from "pinia"
import { computed, reactive } from "vue"
import GlobalFilterSelector from "./GlobalFilterSelector.vue"

const store = useAppStore()

const { globalFilter, global_filter } = storeToRefs(store)
const manager = reactive(GlobalFilterManager.getInstance())
const isEnabled = computed(() => Object.keys(manager.filters).length > 0)

// Whenever corpus selection is changed, update available filters.
corpusSelection.listen(() => manager.update(corpusSelection.getDefaultFilters()))

// When initial corpus selection has settled, start syncing filter values from URL.
corpusSelection.listen(
  once(() => watchImmediate(global_filter, () => manager.setSelection(global_filter.value))),
)

// Whenever filter values are changed
manager.listen(() => {
  // Update the CQP fragment used when searching
  globalFilter.value = manager.getCqp()
  // Update URL
  const selectedValues = manager.getSelection()
  if (!isEqual(global_filter.value, selectedValues)) global_filter.value = selectedValues
})
</script>

<template>
  <div v-if="isEnabled" class="mb-4 d-flex gap-2 align-items-baseline">
    <span class="fw-bold">{{ $t("search.filters") }}:</span>
    <div v-for="filter in manager.filters" :key="filter.attribute.name">
      <GlobalFilterSelector
        v-model="filter.value"
        :label="filter.attribute.label"
        :options="filter.options"
        @update:model-value="manager.updateOptions()"
      />
    </div>
  </div>
</template>
