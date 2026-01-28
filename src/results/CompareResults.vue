<script setup lang="ts">
import type { CompareTask } from "@/core/task/CompareTask"

const props = defineProps<{ task: CompareTask }>()
</script>

<template>
  <div class="vstack gap-2">TODO Compare results {{ task }}</div>
</template>
