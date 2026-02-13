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
    <div class="dropdown-menu card p-0" :aria-labelledby="`export-button-${id}`">
      <form @submit.prevent="onSubmit()">
        <div class="card-body p-2 vstack gap-2">
          <div class="text-muted">{{ $t("result.export.help") }}</div>

          <!-- Custom content -->
          <slot />
        </div>

        <div class="card-footer p-2 hstack align-items-baseline gap-2">
          <!-- Separator field -->
          <div class="d-flex align-items-baseline">
            {{ $t("result.export.separator") }}
            <select
              v-model="separator"
              class="form-select form-select-sm d-inline-block w-auto ms-1"
            >
              <option v-for="(option, key) in CSV_TYPES" :key="key" :value="key">
                {{ $t(`result.export.separator.${key}`) }}
                {{ option.display }}
              </option>
            </select>
          </div>

          <div class="flex-grow-1"></div>

          <!-- Submit button -->
          <button type="submit" class="btn btn-primary btn-sm">
            {{ $t("result.export.action") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
