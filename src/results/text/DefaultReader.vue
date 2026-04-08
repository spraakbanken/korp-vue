<script lang="ts" setup>
import type { ReaderProps } from "./text"
import KwicToken from "../kwic/KwicToken.vue"

defineProps<ReaderProps>()
</script>

<template>
  <div style="white-space: pre">
    <KwicToken
      v-for="(token, i) in document.tokens"
      :key="i"
      :rowToken="{ row: document, token }"
    />
  </div>
</template>
