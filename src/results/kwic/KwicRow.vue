<script setup lang="ts">
import KwicToken from "./KwicToken.vue"
import { isKwic, type Row } from "@/core/kwic/kwic"

defineProps<{ data: Row }>()
</script>

<template>
  <tr v-if="isKwic(data) && !Array.isArray(data.match)">
    <td class="kwic-before">
      <KwicToken v-for="(token, i) in data.tokens.slice(0, data.match.start)" :key="i" :token />
    </td>
    <td class="kwic-match">
      <KwicToken
        v-for="(token, i) in data.tokens.slice(data.match.start, data.match.end)"
        :key="i"
        :token
      />
    </td>
    <td class="kwic-after">
      <KwicToken v-for="(token, i) in data.tokens.slice(data.match.end)" :key="i" :token />
    </td>
  </tr>
</template>

<style scoped>
.kwic-before {
  text-align: end;
}
</style>
