<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { computedAsync } from "@vueuse/core"
import type { CompareItem, CompareResult, CompareTask } from "@/core/task/CompareTask"
import CompareRow from "./CompareRow.vue"
import { useDynamicTabs } from "./useDynamicTabs"
import { useMatomo } from "vue3-matomo"
import { isAbortError } from "@/core/backend/proxy/ProxyBase.ts"
import { useResultState } from "./useResultState.ts"

const props = defineProps<{ task: CompareTask }>()

const progress = defineModel<number>("progress")

const { createTab } = useDynamicTabs()
const { errorMessage, state, setError, setState, listenAbort } = useResultState()
const { t } = useI18n()
const matomo = useMatomo()

listenAbort(props.task, progress)

const result = computedAsync<CompareResult>(async () => {
  progress.value = 0
  setState("loading")
  try {
    const result = await props.task.send()
    progress.value = 100
    setState("done")
    return result
  } catch (error) {
    progress.value = undefined
    if (isAbortError(error)) return
    setError(error)
  }
  return undefined
})

function clickItem(side: 0 | 1, item: CompareItem) {
  const exampleTask = props.task.createExampleTask(side, item)
  createTab(() => t("result.kwic"), exampleTask)
  matomo.value?.trackEvent("Compare", "Subsearch")
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

    <div v-if="result && !result.max" class="alert alert-warning align-self-center">
      {{ $t("result.empty") }}
    </div>

    <div v-if="state == 'aborted'" class="alert alert-warning align-self-center">
      {{ $t("result.aborted") }}
    </div>

    <ErrorBox v-if="errorMessage" v-bind="errorMessage" class="mx-auto mb-0" />
  </div>
</template>
