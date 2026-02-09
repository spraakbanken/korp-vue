<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import KwicResults from "./KwicResults.vue"
import { storeToRefs } from "pinia"
import StatisticsResult from "./statistics/StatisticsResult.vue"
import { vTab } from "@/bootstrap"
import { useDynamicTabs } from "./useDynamicTabs"
import { useLocale } from "@/i18n/useLocale"
import { ref, watch, type Component } from "vue"
import ExampleResults from "./ExampleResults.vue"
import { ExampleTask } from "@/core/task/ExampleTask"
import WordpicResult from "./WordpicResult.vue"
import { WordpicExampleTask } from "@/core/task/WordpicExampleTask"
import CompareResults from "./CompareResults.vue"
import { CompareTask } from "@/core/task/CompareTask"
import type { TaskBase } from "@/core/task/TaskBase"
import { watchImmediate } from "@vueuse/core"
import { TrendTask } from "@/core/task/TrendTask"
import TrendResults from "@/search/TrendResults.vue"
import { MapTask } from "@/core/task/MapTask"
import MapResults from "@/search/MapResults.vue"

const store = useAppStore()
const { dynamicTabs, closeTab } = useDynamicTabs()
const { locObj } = useLocale()

const { result_tab } = storeToRefs(store)
const currentTab = ref<number | string>(result_tab.value)

const tabOptions = [
  { key: 1, name: "kwic" },
  { key: 2, name: "statistics" },
  { key: 3, name: "wordpic" },
]

// Sync active tab to the store.
watch(currentTab, () => {
  // Only sync main tab selection. At initial load from URL, dynamic tabs are not yet created.
  if (typeof currentTab.value == "number") result_tab.value = currentTab.value
})

/** Close a dynamic tab and ensure the current tab is valid */
function closeTabLocal(id: string) {
  const tabIndex = dynamicTabs.findIndex((tab) => tab.id == id)
  closeTab(id)

  // If the closed tab was active, find another tab to select
  // TODO If the closed tab is _not_ active, the active tab styling is lost somehow.
  if (currentTab.value == id) {
    if (dynamicTabs.length) {
      // Select next dynamic tab, or previous if the closed tab was the last one
      const newTabIndex = tabIndex >= dynamicTabs.length ? tabIndex - 1 : tabIndex
      currentTab.value = dynamicTabs[newTabIndex]!.id
    } else {
      // No dynamic tabs left, go to last selected main tab
      currentTab.value = result_tab.value
    }
  }
}

watchImmediate(
  () => dynamicTabs.length,
  (newCount, oldCount) => {
    // When adding a tab, switch to it
    if (newCount > (oldCount || 0)) {
      currentTab.value = dynamicTabs[dynamicTabs.length - 1]!.id
    }
  },
)

function selectTaskResultComponent(task: TaskBase): Component | null {
  // TODO Lazy-load components
  if (task instanceof ExampleTask) return ExampleResults
  if (task instanceof WordpicExampleTask) return ExampleResults
  if (task instanceof CompareTask) return CompareResults
  if (task instanceof MapTask) return MapResults
  if (task instanceof TrendTask) return TrendResults
  return null
}
</script>

<template>
  <div>
    <!-- Tab bar -->
    <nav class="nav nav-tabs" id="result-tabs-list">
      <button
        v-for="{ key, name } in tabOptions"
        :key
        class="nav-link"
        :class="{ active: currentTab == key }"
        :id="`result-tabs-tab-${name}`"
        v-tab
        :aria-controls="`result-tabs-pane-${name}`"
        :aria-selected="currentTab == key"
        @click="currentTab = key"
      >
        {{ $t(`result.${name}`) }}
      </button>

      <button
        v-for="tab in dynamicTabs"
        :key="tab.id"
        class="nav-link"
        :class="{ active: currentTab == tab.id }"
        :id="`result-tabs-tab-${tab.id}`"
        v-tab
        :aria-controls="`result-tabs-pane-${tab.id}`"
        :aria-selected="currentTab == tab.id"
        @click="currentTab = tab.id"
      >
        {{ locObj(tab.label) }}
        <span
          class="btn-close ms-2"
          style="width: 0.1rem; background-size: contain"
          @click.prevent.stop="closeTabLocal(tab.id)"
        ></span>
      </button>
    </nav>

    <!-- Tab content -->
    <div class="tab-content border border-top-0 p-2" id="result-tabs-content">
      <div
        class="tab-pane"
        :class="{ 'show active': currentTab == 1 }"
        id="result-tabs-pane-kwic"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-kwic"
        tabindex="0"
      >
        <KwicResults />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': currentTab == 2 }"
        id="result-tabs-pane-statistics"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-statistics"
        tabindex="0"
      >
        <StatisticsResult :active="currentTab == 2" />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': currentTab == 3 }"
        id="result-tabs-pane-wordpic"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-wordpic"
        tabindex="0"
      >
        <WordpicResult :active="currentTab == 3" />
      </div>

      <div
        v-for="tab in dynamicTabs"
        :key="tab.id"
        class="tab-pane"
        :class="{ 'show active': currentTab == tab.id }"
        :id="`result-tabs-pane-${tab.id}`"
        role="tabpanel"
        :aria-labelledby="`result-tabs-tab-${tab.id}`"
        tabindex="0"
      >
        <component
          :is="selectTaskResultComponent(tab.task as TaskBase)"
          :active="currentTab == tab.id"
          :task="tab.task"
        />
      </div>
    </div>
  </div>
</template>
