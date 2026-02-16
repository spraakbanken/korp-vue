<script lang="ts" setup>
import { range } from "lodash-es"
import { computed } from "vue"

const props = defineProps<{
  max: number
}>()

const model = defineModel({
  default: 1,
  // Prevent out-of-bounds page numbers
  set: (value) => (value >= 1 && value <= props.max ? value : model.value),
})

const pages = computed<number[]>(() => {
  // Show up to 5 pages, with current in the middle if possible
  let start = Math.max(1, model.value - 2)
  let end = Math.min(props.max, model.value + 2)
  if (end - start < 4) {
    if (start == 1) end = Math.min(props.max, start + 4)
    else if (end == props.max) start = Math.max(1, end - 4)
  }
  return range(start, end + 1)
})
</script>

<template>
  <nav :aria-label="$t('result.pagination.label')" class="d-flex align-items-baseline gap-3">
    <div>
      {{ $t("result.pagination.label") }}
      <ul class="pagination pagination-sm d-inline-flex ms-1 mb-0">
        <li class="page-item" :class="{ disabled: model === 1 }">
          <button
            :aria-label="$t('previous')"
            class="page-link"
            @click="model--"
            :disabled="model === 1"
          >
            ‹
          </button>
        </li>
        <li v-for="page in pages" :key="page" class="page-item" :class="{ active: page === model }">
          <button class="page-link" @click="model = page">
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: model === max }">
          <button
            :aria-label="$t('next')"
            class="page-link"
            @click="model++"
            :disabled="model === max"
          >
            ›
          </button>
        </li>
      </ul>
    </div>

    <i18n-t tag="label" scope="global" keypath="result.pagination.goto">
      <template #input>
        <input
          type="number"
          min="1"
          :max="max"
          :value="model"
          @change="model = ($event.target as HTMLInputElement).valueAsNumber"
          class="form-control form-control-sm d-inline-block w-auto"
        />
      </template>
      <template #total>{{ max }}</template>
    </i18n-t>
  </nav>
</template>
