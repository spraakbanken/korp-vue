<script setup lang="ts">
import { vPopover } from "@/bootstrap"
import { useI18n } from "vue-i18n"

defineProps<{
  text: string
}>()

// Use locale as key to reset popover content when language changes
const { locale } = useI18n()
</script>

<template>
  <span
    class="badge text-secondary fst-normal"
    v-popover
    data-bs-toggle="popover"
    data-bs-trigger="focus hover"
    :data-bs-content="text"
    style="cursor: default"
    :key="locale"
  >
    <fa-icon icon="fa-regular fa-circle-question" />
  </span>
</template>
