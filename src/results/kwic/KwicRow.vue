<script setup lang="ts">
import KwicToken from "./KwicToken.vue"
import { isKwic, type Row } from "@/core/kwic/kwic"

defineProps<{ data: Row }>()
</script>

<template>
  <tr v-if="isKwic(data) && !Array.isArray(data.match)">
    <td>
      <div class="d-flex justify-content-end">
        <KwicToken v-for="(token, i) in data.tokens.slice(0, data.match.start)" :key="i" :token />
      </div>
    </td>

    <td class="kwic-match">
      <div class="d-flex justify-content-center">
        <KwicToken
          v-for="(token, i) in data.tokens.slice(data.match.start, data.match.end)"
          :key="i"
          :token
        />
      </div>
    </td>

    <td>
      <div class="d-flex justify-content-start">
        <KwicToken v-for="(token, i) in data.tokens.slice(data.match.end)" :key="i" :token />
      </div>
    </td>
  </tr>
</template>
