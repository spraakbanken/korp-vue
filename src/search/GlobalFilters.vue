<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { isEqual, once, sortBy } from "lodash"
import { storeToRefs } from "pinia"
import { computed, reactive } from "vue"

const store = useAppStore()
const { locObj } = useLocale()

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
      <!-- TODO Write custom selector component. Firefox cannot do `multiple size="1"`. -->
      <select
        class="form-select"
        multiple
        size="1"
        v-model="filter.value"
        @change="manager.updateOptions()"
      >
        <option value="" disabled selected>
          {{ $t("search.filters.add", [locObj(filter.attribute.label)]) }}
        </option>

        <option
          v-for="[value, hits] in sortBy(
            filter.options,
            (option) => option[1] == 0,
            (option) => !filter.value.includes(option[0]),
          )"
          :key="value"
          :value
          :disabled="hits == 0"
        >
          {{ value }} ({{ hits }})
        </option>
      </select>
    </div>
  </div>
</template>
