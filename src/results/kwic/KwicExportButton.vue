<script lang="ts" setup>
import { reactive, ref } from "vue"
import ExportButton from "../ExportButton.vue"
import { transformData, type ExportType } from "@/core/kwic/export"
import type { Row } from "@/core/kwic/kwic"
import type { ConcordanceEndpoint } from "@/core/backend/ConcordanceEndpoint"
import type { DependencyRelationsSentencesEndpoint } from "@/core/backend/DependencyRelationsSentencesEndpoint"

const exportType = ref<ExportType>("kwic")

const props = defineProps<{
  kwic?: Row[]
  endpoint: ConcordanceEndpoint | DependencyRelationsSentencesEndpoint
  totalHits: number
}>()

const proxy = reactive(props.endpoint)

function getRows() {
  return transformData(exportType.value, props.kwic!, props.endpoint.getParams()!, props.totalHits)
}
</script>

<template>
  <ExportButton :disabled="!kwic" name="kwic" :getRows :json="proxy.getResponse()" endpoint="query">
    <div class="text-nowrap">
      <div v-for="option in ['kwic', 'annotations']" :key="option" class="form-check">
        <input
          type="radio"
          class="form-check-input"
          :id="`export-type-${option}`"
          :value="option"
          v-model="exportType"
        />
        <label :for="`export-type-${option}`" class="form-check-label">
          {{ $t(`result.kwic.export.type.${option}`) }}
        </label>
      </div>
    </div>
  </ExportButton>
</template>
