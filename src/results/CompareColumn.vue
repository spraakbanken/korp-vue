<script setup lang="ts">
import type { CompareItem } from "@/core/task/CompareTask"

defineProps<{
  items: CompareItem[]
  max: number
  left?: boolean
}>()

defineEmits<{
  (e: "select", item: CompareItem): void
}>()
</script>

<template>
  <ul class="list-group">
    <li
      v-for="item in items"
      :key="item.key"
      class="list-group-item position-relative link"
      @click="$emit('select', item)"
    >
      <!-- Background bar -->
      <div
        class="position-absolute h-100 top-0"
        :class="left ? 'bg-info-subtle end-0' : 'bg-warning-subtle start-0'"
        :style="{ width: `${Math.abs(item.loglike / max) * 100}%` }"
      ></div>
      <!-- Text -->
      <div class="d-flex justify-content-between align-items-baseline position-relative z-1">
        {{ String(item.tokenLists) }}
        <span class="text-muted">{{ item.abs }}</span>
      </div>
    </li>
  </ul>
</template>
