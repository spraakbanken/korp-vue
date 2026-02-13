<script setup lang="ts">
import { CSV_TYPES, downloadCsvFile, type CsvType } from "@/core/services/csv"
import { ref, useId } from "vue"

const props = defineProps<{
  name: string
  getRows: () => Iterable<(string | number)[]>
}>()

const id = useId()
const separator = ref<CsvType>("tab")

function onSubmit() {
  const rows = props.getRows()
  downloadCsvFile(props.name, rows, separator.value)
}
</script>

<template>
  <div class="dropdown open">
    <!-- Dropdown trigger button -->
    <button
      class="btn btn-secondary dropdown-toggle"
      type="button"
      :id="`export-button-${id}`"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-haspopup="true"
      aria-expanded="false"
    >
      {{ $t("result.export.action") }}
    </button>

    <!-- Dropdown form -->
    <div class="dropdown-menu p-2" :aria-labelledby="`export-button-${id}`">
      <form @submit.prevent="onSubmit()" class="vstack gap-2">
        <!-- Separator field -->
        <div>
          <div class="form-label">{{ $t("result.export.separator") }}</div>

          <div
            v-for="option in Object.keys(CSV_TYPES)"
            :key="option"
            class="form-check form-check-inline"
          >
            <input
              type="radio"
              class="form-check-input"
              :id="`${id}-${option}`"
              :value="option"
              v-model="separator"
            />
            <label :for="`${id}-${option}`" class="form-check-label">
              <code>{{ CSV_TYPES[option as CsvType].display }}</code>
              {{ $t(`result.export.separator.${option}`) }}
            </label>
          </div>
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary">{{ $t("result.export.action") }}</button>
      </form>
    </div>
  </div>
</template>
