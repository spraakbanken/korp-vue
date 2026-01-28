<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { computedAsync } from "@vueuse/core"
import type { CompareItem, CompareResult, CompareTask } from "@/core/task/CompareTask"
import CompareColumn from "./CompareColumn.vue"
import { useDynamicTabs } from "./useDynamicTabs"

const props = defineProps<{ task: CompareTask }>()

const { createTab } = useDynamicTabs()
const { t } = useI18n()

const result = computedAsync<CompareResult>(() => props.task.send())

function clickItem(side: 0 | 1, item: CompareItem) {
  const exampleTask = props.task.createExampleTask(side, item)
  createTab(t("result.kwic"), exampleTask)
}
</script>

<template>
  <div class="vstack gap-2">
    <div v-if="result" class="row">
      <div class="col-sm-6">
        <h3>{{ $t("result.compare.column_heading", { label: result.cmp1.label }) }}</h3>
        <CompareColumn
          :items="result.tables.negative"
          :max="result.max"
          left
          @select="(item) => clickItem(0, item)"
        />
      </div>
      <div class="col-sm-6">
        <h3>{{ $t("result.compare.column_heading", { label: result.cmp2.label }) }}</h3>
        <CompareColumn
          :items="result.tables.positive"
          :max="result.max"
          @select="(item) => clickItem(1, item)"
        />
      </div>
    </div>
  </div>
</template>
