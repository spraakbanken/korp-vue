<script setup lang="ts">
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { sortBy } from "lodash"
import { storeToRefs } from "pinia"
import { computed, reactive, ref, watch } from "vue"

const store = useAppStore()
const { locObj } = useLocale()

const { globalFilter, global_filter } = storeToRefs(store)
const isEnabled = computed(() => attrs.value.length > 0)
const manager = reactive(new GlobalFilterManager())
const attrs = ref<Attribute[]>(corpusSelection.getDefaultFilters())

corpusSelection.listen(() => (attrs.value = corpusSelection.getDefaultFilters()))
watch(attrs, (attrs) => manager.update(attrs))

manager.listen(() => {
  // Update the CQP fragment used when searching
  globalFilter.value = manager.getCqp()
  // Update URL
  global_filter.value = manager.getSelection()
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
        v-model.lazy="filter.value"
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
