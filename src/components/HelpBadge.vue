<script setup lang="ts">
import { vPopover } from "@/bootstrap"

defineProps<{
  text: string
}>()
</script>

<template>
  <span
    class="badge text-secondary fst-normal"
    v-popover
    data-bs-toggle="popover"
    data-bs-trigger="focus hover"
    :data-bs-content="text"
  >
    🛈
  </span>
</template>
