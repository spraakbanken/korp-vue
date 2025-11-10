<script setup lang="ts">
import type { ApiKwic } from "@/core/api/types"
import KwicRow from "./KwicRow.vue"

defineProps<{ data: ApiKwic[] }>()
</script>

<template>
  <table>
    <tbody>
      <KwicRow v-for="(row, i) in data" :key="i" :data="row" />
    </tbody>
  </table>
</template>
