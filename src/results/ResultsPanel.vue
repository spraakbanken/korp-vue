<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import KwicResults from "./KwicResults.vue"
import { storeToRefs } from "pinia"
import StatisticsResult from "./StatisticsResult.vue"
import { vTab } from "@/bootstrap"
import { useDynamicTabs } from "./useDynamicTabs"
import { useLocale } from "@/i18n/useLocale"
import { ref, watch } from "vue"
import ExampleResults from "./ExampleResults.vue"
import { ExampleTask } from "@/core/task/ExampleTask"

const store = useAppStore()
const { dynamicTabs } = useDynamicTabs()
const { locObj } = useLocale()

const { result_tab } = storeToRefs(store)
const currentTab = ref<number | string>(result_tab.value)

const tabOptions = [
  { key: 1, name: "kwic" },
  { key: 2, name: "statistics" },
  { key: 3, name: "wordpicture" },
]

watch(currentTab, () => {
  if (typeof currentTab.value == "number") result_tab.value = currentTab.value
})
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
        id="result-tabs-pane-wordpicture"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-wordpicture"
        tabindex="0"
      >
        TODO Word picture
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
        <ExampleResults v-if="tab.task instanceof ExampleTask" :task="tab.task" />
        <div v-else>TODO Dynamic tab for {{ tab.task }}</div>
      </div>
    </div>
  </div>
</template>
