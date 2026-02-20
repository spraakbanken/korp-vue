<script setup lang="ts">
import { computed, ref, useId, type Ref } from "vue"
import { useSearchStorage } from "../search/useSearchStorage"
import { watchImmediate } from "@vueuse/core"
import { corpusListing } from "@/core/corpora/corpusListing"
import AttributeSelector from "@/AttributeSelector.vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { CompareTask, type SavedSearch } from "@/core/task/CompareTask"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useI18n } from "vue-i18n"

const { removeSearch, searches } = useSearchStorage()
const { createTab } = useDynamicTabs()
const { t } = useI18n()

const id = useId()
const attribute = ref<Attribute>()
const queryLeft = ref<SavedSearch | null>(searches.value[0] || null)
const queryRight = ref<SavedSearch | null>(searches.value[1] || null)

const attributes = computed(() => {
  if (!queryLeft.value || !queryRight.value) return []
  const corpusSet = corpusListing.pick([...queryLeft.value.corpora, ...queryRight.value.corpora])
  return corpusSet.getAttributeGroupsCompare()
})

watchImmediate(searches, () => {
  // Update default selected searches when adding new searches.
  if (!queryLeft.value) queryLeft.value = searches.value[0] || null
  if (!queryRight.value)
    queryRight.value = searches.value[1] || searches.value[0] || null
})

watchImmediate(attributes, () => {
  // Default to first attribute if none is selected
  if (attributes.value.length && !attribute.value) attribute.value = attributes.value[0]
})

function submit() {
  if (
    !queryLeft.value ||
    !queryRight.value ||
    !attribute.value ||
    queryLeft.value == queryRight.value
  )
    return
  const task = new CompareTask(queryLeft.value, queryRight.value, [attribute.value.name])
  createTab(t("search.compare"), task)
}

/** Remove the currently selected left or right search */
function removeSearchLocal(search: SavedSearch) {
  // Remember index of removed search
  const prevIndex = searches.value.findIndex((s) => s == search)

  removeSearch(search)

  // Update selectors that may have the removed search selected:
  // Select next in the list, or the previous one if the removed was the last
  const newIndex = Math.min(prevIndex, searches.value.length - 1)

  for (const queryRef of [queryLeft, queryRight]) {
    if (queryRef.value == search) {
      queryRef.value = searches.value[newIndex] || null
    }
  }
}
</script>

<template>
  <form class="w-max-md vstack gap-4" @submit.prevent="submit()">
    <div>{{ $t("search.compare.help") }}</div>

    <div class="row row-gap-2">
      <div class="col-sm-6 col-md-4">
        <!-- Left search selector -->
        <label :for="`${id}-left`" class="form-label">
          {{ $t("search.compare.search_left") }}
        </label>
        <select
          v-model="queryLeft"
          :id="`${id}-left`"
          class="form-select"
          :disabled="!searches.length"
        >
          <option v-for="query in searches" :key="query.corpora + query.cqp" :value="query">
            {{ query.label }}
          </option>
        </select>

        <!-- Left remove button -->
        <button
          type="button"
          class="d-block btn btn-sm link-danger mx-auto"
          :class="{ invisible: !queryLeft }"
          @click="removeSearchLocal(queryLeft!)"
        >
          {{ $t("remove") }}
        </button>
      </div>

      <div class="col-sm-6 col-md-4">
        <!-- Right search selector -->
        <label :for="`${id}-right`" class="form-label">
          {{ $t("search.compare.search_right") }}
        </label>
        <select
          v-model="queryRight"
          :id="`${id}-right`"
          class="form-select"
          :disabled="!searches.length"
        >
          <option v-for="query in searches" :key="query.corpora + query.cqp" :value="query">
            {{ query.label }}
          </option>
        </select>

        <!-- Right remove button -->
        <button
          type="button"
          class="d-block btn btn-sm link-danger mx-auto"
          :class="{ invisible: !queryRight }"
          @click="removeSearchLocal(queryRight!)"
        >
          {{ $t("remove") }}
        </button>
      </div>

      <div class="col-sm-12 col-md-4">
        <label :for="`${id}-attribute`" class="form-label">
          {{ $t("search.compare.attribute") }}
        </label>
        <AttributeSelector
          v-model="attribute"
          :options="attributes"
          :disabled="!attributes.length"
          :id="`${id}-attribute`"
        />
      </div>
    </div>

    <div class="d-flex justify-content-center">
      <input type="submit" class="btn btn-primary" :value="$t('search.compare.submit')" />
    </div>
  </form>
</template>
