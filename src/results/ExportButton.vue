<script setup lang="ts">
import { CSV_TYPES, downloadCsvFile, type CsvType } from "@/core/services/csv"
import { ref, useId } from "vue"
import { useMatomo } from "vue3-matomo"
import { downloadFile } from "@/core/util"

const props = defineProps<{
  disabled?: boolean
  /** API endpoint name for JSON filename */
  endpoint?: string
  /** API response to use for JSON download */
  json?: object
  name: string
  getRows: () => Iterable<(string | number)[]>
}>()

const matomo = useMatomo()

const id = useId()
const separator = ref<CsvType>("tab")

function onSubmit() {
  const rows = props.getRows()
  downloadCsvFile(props.name, rows, separator.value)
  matomo.value?.trackEvent("Result", "Download export", `${props.name} ${separator.value}`)
}

function download() {
  const json = JSON.stringify(props.json, null, 2)
  const endpoint = props.endpoint || "response"
  downloadFile(json, `korp-${endpoint}.json`, "application/json")
  matomo.value?.trackEvent("Result", "Download JSON", endpoint)
}
</script>

<template>
  <div class="dropdown btn-group">
    <!-- Dropdown trigger button -->
    <button
      class="btn btn-secondary dropdown-toggle"
      type="button"
      :id="`export-button-${id}`"
      :disabled
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <fa-icon icon="fa-solid fa-download" />
      {{ $t("result.export.action") }}
    </button>

    <!-- Dropdown form -->
    <div
      class="dropdown-menu card p-0"
      :aria-labelledby="`export-button-${id}`"
      style="width: 20em"
    >
      <form @submit.prevent="onSubmit()">
        <!-- CSV section -->
        <h6 class="card-header p-2">
          {{ $t("result.export.table") }}
        </h6>

        <div class="card-body p-2 vstack gap-2">
          <p class="m-0">{{ $t("result.export.table.help") }}</p>

          <!-- Custom content -->
          <slot />

          <div class="hstack align-items-baseline gap-2">
            <!-- Separator field -->
            <div class="d-flex align-items-baseline">
              {{ $t("result.export.table.separator") }}
              <select
                v-model="separator"
                class="form-select form-select-sm d-inline-block w-auto ms-1"
              >
                <option v-for="(option, key) in CSV_TYPES" :key="key" :value="key">
                  {{ $t(`result.export.table.separator.${key}`) }}
                  {{ option.display }}
                </option>
              </select>
            </div>

            <div class="flex-grow-1"></div>

            <!-- Submit button -->
            <button type="submit" class="btn btn-primary btn-sm">
              <fa-icon icon="fa-solid fa-download" />
              {{ $t("result.export.action") }}
            </button>
          </div>
        </div>
      </form>

      <form @submit.prevent="download()">
        <!-- JSON section -->
        <template v-if="props.json">
          <h6 class="card-header card-footer p-2">
            {{ $t("result.export.json") }}
          </h6>
          <div class="card-body p-2 vstack gap-2">
            <p class="m-0">{{ $t("result.export.json.help") }}</p>

            <button type="submit" class="btn btn-primary btn-sm d-block ms-auto">
              <fa-icon icon="fa-solid fa-download" />
              {{ $t("result.export.action") }}
            </button>
          </div>
        </template>
      </form>
    </div>
  </div>
</template>
