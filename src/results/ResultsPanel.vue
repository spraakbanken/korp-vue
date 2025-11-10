<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import KwicResults from "./KwicResults.vue"
import { storeToRefs } from "pinia"
import StatisticsResult from "./StatisticsResult.vue"

const store = useAppStore()
const { resultTab } = storeToRefs(store)
</script>

<template>
  <div>
    <button @click="resultTab = 1">KWIC</button>
    <button @click="resultTab = 2">Statistics</button>
  </div>
  <div>
    <KwicResults v-if="resultTab == 1" />
    <StatisticsResult v-if="resultTab == 2" />
  </div>
</template>
