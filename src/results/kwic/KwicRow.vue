<script setup lang="ts">
import KwicToken from "./KwicToken.vue"
import { isKwic, type Row } from "@/core/kwic/kwic"

defineProps<{ row: Row }>()
</script>

<template>
  <tr v-if="isKwic(row) && !Array.isArray(row.match)">
    <td class="pe-0 text-end">
      <KwicToken v-for="(token, i) in row.tokens.slice(0, row.match.start)" :key="i" :row :token />
    </td>

    <td class="kwic-match px-1 text-center">
      <KwicToken
        v-for="(token, i) in row.tokens.slice(row.match.start, row.match.end)"
        :key="i"
        :row
        :token
      />
    </td>

    <td class="ps-0 text-start">
      <KwicToken v-for="(token, i) in row.tokens.slice(row.match.end)" :key="i" :row :token />
    </td>
  </tr>

  <tr v-else>
    (TODO non-KWIC row)
  </tr>
</template>
