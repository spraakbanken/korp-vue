<script setup lang="ts">
import { provide } from "vue"
import { type RowToken } from "@/core/kwic/kwic"
import KwicSidebar from "./KwicSidebar.vue"
import { injectionKeys } from "@/injection"

const selectedToken = defineModel<RowToken>()

provide(injectionKeys.selectedToken, selectedToken)
</script>

<template>
  <div
    class="position-relative"
    style="min-height: 50rem"
    :style="{
      // Make room for sidebar
      paddingInlineEnd: selectedToken ? '21rem' : undefined,
    }"
  >
    <slot />

    <KwicSidebar style="width: 20rem" />
  </div>
</template>
