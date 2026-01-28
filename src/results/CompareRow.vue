<script setup lang="ts">
import type { CompareItem } from "@/core/task/CompareTask"
import { vPopover } from "@/bootstrap"
import { useI18n } from "vue-i18n"
import { formatDecimals } from "@/core/i18n"
import { computed } from "vue"

const props = defineProps<{
  item: CompareItem
  max: number
  left?: boolean
}>()

defineEmits<{
  (e: "select", item: CompareItem): void
}>()

const { t } = useI18n()

// TODO This is recomputed on lang change, but popover content is not updated
const statsHtml = computed(() => {
  const stats = {
    freq: String(props.item.abs),
    loglike: formatDecimals(Math.abs(props.item.loglike), 2),
  }
  return Object.entries(stats)
    .map(([key, value]) => `<strong>${t(`stat.${key}`)}:</strong> ${value}`)
    .join("<br />")
})
</script>

<template>
  <li class="list-group-item position-relative">
    <!-- Background bar -->
    <div
      class="position-absolute h-100 top-0"
      :class="left ? 'bg-info-subtle end-0' : 'bg-warning-subtle start-0'"
      :style="{ width: `${Math.abs(item.loglike / max) * 100}%` }"
    ></div>

    <div class="hstack align-items-baseline position-relative z-1">
      <!-- Value string -->
      <span class="link flex-grow-1" @click="$emit('select', item)">
        {{ String(item.tokenLists) }}
      </span>

      <!-- Frequency -->
      <span
        v-popover
        data-bs-toggle="popover"
        data-bs-trigger="focus hover"
        data-bs-delay="200"
        data-bs-html="true"
        :data-bs-content="statsHtml"
        class="text-muted"
      >
        {{ item.abs }}
      </span>
    </div>
  </li>
</template>
