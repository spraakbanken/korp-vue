<script setup lang="ts">
import type { Token } from "@/core/backend/types"

defineProps<{
  token: Token
}>()
</script>

<template>
  <span
    class="kwic-token"
    :class="{ 'kwic-token-match': token._match, 'kwic-token-punct': token._punct }"
  >
    {{ token.word }}
  </span>
</template>

<style>
.kwic-token {
  margin-inline: 0.15em;
}
.kwic-token-punct {
  margin-inline-start: -0.15em;
}
.kwic-token-match {
  font-weight: bold;
}
</style>
