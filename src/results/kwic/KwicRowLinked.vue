<script setup lang="ts">
import KwicToken from "./KwicToken.vue"
import type { LinkedKwicRow } from "@/core/kwic/kwic"

defineProps<{ row: LinkedKwicRow }>()
</script>

<template>
  <tr>
    <td colspan="3" class="text-center fst-italic opacity-75">
      <KwicToken v-for="(token, i) in row.tokens" :key="i" :row-token="{ row, token }" />
    </td>
  </tr>
</template>
