<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import { computed, ref } from "vue"
import { useSearchStorage } from "../search/useSearchStorage"
import { watchImmediate } from "@vueuse/core"
import { corpusListing } from "@/core/corpora/corpusListing"
import AttributeSelector from "@/AttributeSelector.vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"

export type SavedSearch = {
  label: string
  cqp: string
  corpora: string[]
}

const store = useAppStore()
const { searches } = useSearchStorage()

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
  if (searches.value.length && !queryLeft.value) {
    queryLeft.value = searches.value[0]!
  }
  if (searches.value.length > 1 && !queryRight.value) {
    queryRight.value = searches.value[1]!
  }
})

watchImmediate(attributes, () => {
  // Default to first attribute if none is selected
  if (attributes.value.length && !attribute.value) attribute.value = attributes.value[0]
})
</script>

<template>
  <div class="vstack gap-2">
    <div class="alert alert-secondary">🛈 {{ $t("result.compare.help") }}</div>

    <div class="hstack gap-4">
      <div>
        <label class="form-label">
          {{ $t("result.compare.search_left") }}
          <select v-model="queryLeft" class="form-select" :disabled="!searches.length">
            <option v-for="query in searches" :key="query.cqp" :value="query">
              {{ query.label }}
            </option>
          </select>
        </label>
      </div>

      <div>
        <label class="form-label">
          {{ $t("result.compare.search_right") }}
          <select v-model="queryRight" class="form-select" :disabled="!searches.length">
            <option v-for="query in searches" :key="query.cqp" :value="query">
              {{ query.label }}
            </option>
          </select>
        </label>
      </div>

      <div>
        <label class="form-label">
          {{ $t("result.compare.attribute") }}
          <AttributeSelector
            v-model="attribute"
            :options="attributes"
            :disabled="!attributes.length"
          />
        </label>
      </div>
    </div>
  </div>
</template>
