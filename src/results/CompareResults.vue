<script setup lang="ts">
import type { CompareResult, CompareTask } from "@/core/task/CompareTask"
import { computedAsync } from "@vueuse/core"
import CompareColumn from "./CompareColumn.vue"

const props = defineProps<{ task: CompareTask }>()
const response = computedAsync<CompareResult>(() => props.task.send())
</script>

<template>
  <div class="vstack gap-2">
    <div v-if="response" class="row">
      <div class="col-sm-6">
        <h3>{{ $t("result.compare.column_heading", { label: response.cmp1.label }) }}</h3>
        <CompareColumn :items="response.tables.negative" :max="response.max" polarity="negative" />
      </div>
      <div class="col-sm-6">
        <h3>{{ $t("result.compare.column_heading", { label: response.cmp2.label }) }}</h3>
        <CompareColumn :items="response.tables.positive" :max="response.max" polarity="positive" />
      </div>
    </div>
  </div>
</template>
