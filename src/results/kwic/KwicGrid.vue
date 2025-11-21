<script setup lang="ts">
import KwicRow from "./KwicRow.vue"
import type { Row } from "@/core/kwic/kwic"

defineProps<{ data: Row[] }>()
</script>

<template>
  <table>
    <tbody>
      <KwicRow v-for="(row, i) in data" :key="i" :data="row" />
    </tbody>
  </table>
</template>
