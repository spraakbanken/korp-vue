<script setup lang="ts">
import type { TrendTask } from "@/core/task/TrendTask"

defineProps<{
  task: TrendTask
}>()
</script>

<template>
  {{ task }}
</template>
