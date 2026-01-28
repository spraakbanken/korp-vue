<script setup lang="ts">
import type { CompareItem } from "@/core/task/CompareTask"

const props = defineProps<{
  items: CompareItem[]
  max: number
  polarity: "positive" | "negative"
}>()

const isLeft = props.polarity === "negative"
</script>

<template>
  <ul class="list-group">
    <li v-for="item in items" :key="item.key" class="list-group-item position-relative">
      <div
        class="position-absolute h-100 top-0"
        :class="isLeft ? 'bg-info-subtle end-0' : 'bg-warning-subtle start-0'"
        :style="{ width: `${Math.abs(item.loglike / max) * 100}%` }"
      ></div>
      <div class="d-flex justify-content-between align-items-baseline position-relative z-1">
        {{ String(item.tokenLists) }}
        <span class="text-muted">
          {{ item.abs }}
        </span>
      </div>
    </li>
  </ul>
</template>
