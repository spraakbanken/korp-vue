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
    <nav>
      <button @click="resultTab = 1">KWIC</button>
      <button @click="resultTab = 2">Statistics</button>
    </nav>
    <section>
      <KwicResults v-show="resultTab == 1" />
      <StatisticsResult v-show="resultTab == 2" />
    </section>
  </div>
</template>
