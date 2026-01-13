<script setup lang="ts">
import KwicToken from "./KwicToken.vue"
import { isKwic, type Row } from "@/core/kwic/kwic"

defineProps<{ row: Row }>()
</script>

<template>
  <tr v-if="isKwic(row) && !Array.isArray(row.match)">
    <td class="pe-0">
      <div class="d-flex justify-content-end">
        <KwicToken
          v-for="(token, i) in row.tokens.slice(0, row.match.start)"
          :key="i"
          :row
          :token
        />
      </div>
    </td>

    <td class="kwic-match px-0">
      <div class="d-flex justify-content-center">
        <KwicToken
          v-for="(token, i) in row.tokens.slice(row.match.start, row.match.end)"
          :key="i"
          :row
          :token
        />
      </div>
    </td>

    <td class="ps-0">
      <div class="d-flex justify-content-start">
        <KwicToken
          v-for="(token, i) in row.tokens.slice(row.match.end)"
          :key="i"
          :row
          :token
        />
      </div>
    </td>
  </tr>

  <tr v-else>
    (TODO non-KWIC row)
  </tr>
</template>
