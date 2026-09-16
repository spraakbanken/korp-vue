<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { CompareItem, CompareTask } from "@/core/task/CompareTask"
import CompareRow from "./CompareRow.vue"
import { useDynamicTabs } from "./useDynamicTabs"
import { useMatomo } from "vue3-matomo"
import { useResult } from "./useResult"
import { onMounted } from "vue"
import ResultsDisplay from "./ResultsDisplay.vue"

const props = defineProps<{ task: CompareTask }>()

const progress = defineModel<number>("progress")

const { createTab } = useDynamicTabs()
const { t } = useI18n()
const matomo = useMatomo()

onMounted(() => loadResult())

const load = () => props.task.send()
const { data: result, loadResult } = useResult(progress, load, props.task)

function clickItem(side: 0 | 1, item: CompareItem) {
  const exampleTask = props.task.createExampleTask(side, item)
  createTab(() => t("result.kwic"), exampleTask)
  matomo.value?.trackEvent("Compare", "Subsearch")
}
</script>

<template>
  <div class="vstack gap-2">
    <ResultsDisplay :populated="!!result?.max">
      <div v-if="result" class="row">
        <div class="col-sm-6">
          <h3>{{ $t("result.compare.column_heading", { label: task.cmp1.label }) }}</h3>
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
          <h3>{{ $t("result.compare.column_heading", { label: task.cmp2.label }) }}</h3>
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
    </ResultsDisplay>
  </div>
</template>
