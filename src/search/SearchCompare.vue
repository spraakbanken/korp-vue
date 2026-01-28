<script setup lang="ts">
import { computed, ref, useId } from "vue"
import { useSearchStorage } from "../search/useSearchStorage"
import { watchImmediate } from "@vueuse/core"
import { corpusListing } from "@/core/corpora/corpusListing"
import AttributeSelector from "@/AttributeSelector.vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import { CompareTask, type SavedSearch } from "@/core/task/CompareTask"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useI18n } from "vue-i18n"

const { searches } = useSearchStorage()
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

function submit() {
  if (!queryLeft.value || !queryRight.value || !attribute.value) return
  const task = new CompareTask(queryLeft.value, queryRight.value, [attribute.value.name])
  createTab(t("search.compare"), task)
}
</script>

<template>
  <form class="container-max-md vstack gap-2" @submit.prevent="submit()">
    <p>{{ $t("search.compare.help") }}</p>

    <div class="row">
      <div class="col-sm-6 mb-2">
        <label :for="`${id}-left`" class="form-label">
          {{ $t("search.compare.search_left") }}
        </label>
        <select
          v-model="queryLeft"
          :id="`${id}-left`"
          class="form-select"
          :disabled="!searches.length"
        >
          <option v-for="query in searches" :key="query.cqp" :value="query">
            {{ query.label }}
          </option>
        </select>
      </div>

      <div class="col-sm-6">
        <label :for="`${id}-right`" class="form-label">
          {{ $t("search.compare.search_right") }}
        </label>
        <select
          v-model="queryRight"
          :id="`${id}-right`"
          class="form-select"
          :disabled="!searches.length"
        >
          <option v-for="query in searches" :key="query.cqp" :value="query">
            {{ query.label }}
          </option>
        </select>
      </div>
    </div>

    <div>
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

    <div class="d-flex justify-content-center">
      <input type="submit" class="btn btn-primary" :value="$t('search.compare.submit')" />
    </div>
  </form>
</template>
