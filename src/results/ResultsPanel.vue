<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import KwicResults from "./KwicResults.vue"
import { storeToRefs } from "pinia"
import StatisticsResult from "./StatisticsResult.vue"
import { vTab } from "@/bootstrap"

const store = useAppStore()
const { resultTab } = storeToRefs(store)

const tabOptions = [
  { key: 1, name: "kwic" },
  { key: 2, name: "statistics" },
  { key: 3, name: "wordpicture" },
]
</script>

<template>
  <div>
    <!-- Tab bar -->
    <nav class="nav nav-tabs" id="result-tabs-list">
      <button
        v-for="{ key, name } in tabOptions"
        :key
        class="nav-link"
        :class="{ active: resultTab == key }"
        :id="`result-tabs-tab-${name}`"
        v-tab
        :aria-controls="`result-tabs-pane-${name}`"
        :aria-selected="resultTab == key"
        @click="resultTab = key"
      >
        {{ $t(`result.${name}`) }}
      </button>
    </nav>

    <!-- Tab content -->
    <div class="tab-content border border-top-0 p-2" id="result-tabs-content">
      <div
        class="tab-pane"
        :class="{ 'show active': resultTab == 1 }"
        id="result-tabs-pane-kwic"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-kwic"
        tabindex="0"
      >
        <KwicResults />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': resultTab == 2 }"
        id="result-tabs-pane-statistics"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-statistics"
        tabindex="0"
      >
        <StatisticsResult />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': resultTab == 3 }"
        id="result-tabs-pane-wordpicture"
        role="tabpanel"
        aria-labelledby="result-tabs-tab-wordpicture"
        tabindex="0"
      >
        TODO Word picture
      </div>
    </div>
  </div>
</template>
