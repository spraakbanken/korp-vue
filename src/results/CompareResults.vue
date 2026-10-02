<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { CompareItem, CompareTask } from "@/core/task/CompareTask"
import CompareRow from "./CompareRow.vue"
import { useDynamicTabs } from "./useDynamicTabs"
import { useMatomo } from "vue3-matomo"
import { useResult } from "./useResult"
import { onMounted, ref } from "vue"
import ResultsDisplay from "./ResultsDisplay.vue"
import OptionsBar from "@/components/OptionsBar.vue"
import ExportButton from "./ExportButton.vue"

const props = defineProps<{ task: CompareTask }>()

const progress = defineModel<number>("progress")

const { createTab } = useDynamicTabs()
const { t } = useI18n()
const matomo = useMatomo()

const PAGE_SIZE = 100
const limit = ref(PAGE_SIZE)

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
    <OptionsBar>
      <template #end>
        <ExportButton
          :disabled="!result"
          name="comparison"
          :get-rows="() => task.createCsv(result!)"
          endpoint="count"
        />
      </template>
    </OptionsBar>

    <ResultsDisplay :populated="!!result?.max">
      <div v-if="result" class="row">
        <div class="col-sm-6">
          <div class="sticky-top bg-body">
            <h3>{{ $t("result.compare.column_heading", { label: task.cmp1.label }) }}</h3>
          </div>
          <ul class="list-group">
            <CompareRow
              v-for="item in result.tables.negative.slice(0, limit)"
              :key="item.key"
              :attributes="task.attributes"
              :item
              :max="result.max"
              left
              @select="() => clickItem(0, item)"
            />
          </ul>
        </div>
        <div class="col-sm-6">
          <div class="sticky-top bg-body">
            <h3>{{ $t("result.compare.column_heading", { label: task.cmp2.label }) }}</h3>
          </div>
          <ul class="list-group">
            <CompareRow
              v-for="item in result.tables.positive.slice(0, limit)"
              :key="item.key"
              :attributes="task.attributes"
              :item
              :max="result.max"
              @select="() => clickItem(1, item)"
            />
          </ul>
        </div>
      </div>

      <!-- "View more" button -->
      <div v-if="result" class="my-4 hstack justify-content-center">
        <button
          v-if="limit < result.max"
          class="btn btn-outline-secondary"
          @click="limit += PAGE_SIZE"
        >
          <fa-icon icon="fa-solid fa-angles-down" />
          {{ $t("show_more") }}
        </button>
      </div>
    </ResultsDisplay>
  </div>
</template>

<style scoped>
.sticky-top {
  /* Prevent covering dropdowns in the options bar */
  z-index: 900;
}
</style>
