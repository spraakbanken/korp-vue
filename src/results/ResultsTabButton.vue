<script setup lang="ts">
import { injectionKeys } from "@/injection"
import { provide } from "vue"

const progress = defineModel<number>({ required: true })

provide(injectionKeys.resultProgress, progress)
</script>

<template>
  <slot />
</template>
