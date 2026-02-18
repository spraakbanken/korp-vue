<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { computedAsync } from "@vueuse/core"
import type { CompareItem, CompareResult, CompareTask } from "@/core/task/CompareTask"
import CompareRow from "./CompareRow.vue"
import { useDynamicTabs } from "./useDynamicTabs"

const props = defineProps<{ task: CompareTask }>()

const progress = defineModel<number>("progress")

const { createTab } = useDynamicTabs()
const { t } = useI18n()

const result = computedAsync<CompareResult>(async () => {
  progress.value = 0
  const result = await props.task.send()
  progress.value = 100
  return result
})

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
        <ul class="list-group">
          <CompareRow
            v-for="item in result.tables.negative"
            :key="item.key"
            :item
            :max="result.max"
            left
            @select="() => clickItem(0, item)"
          />
        </ul>
      </div>
      <div class="col-sm-6">
        <h3>{{ $t("result.compare.column_heading", { label: result.cmp2.label }) }}</h3>
        <ul class="list-group">
          <CompareRow
            v-for="item in result.tables.positive"
            :key="item.key"
            :item
            :max="result.max"
            @select="() => clickItem(1, item)"
          />
        </ul>
      </div>
    </div>
  </div>
</template>
