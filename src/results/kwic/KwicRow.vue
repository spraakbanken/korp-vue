<script setup lang="ts">
import type { ApiKwic } from "@/core/backend/types"
import KwicToken from "./KwicToken.vue"

const props = defineProps<{ row: ApiKwic }>()

if (Array.isArray(props.row.match)) throw new Error("Cannot handle multi-match KWIC rows")
const match = props.row.match
</script>

<template>
  <tr>
    <td class="pe-0 text-end">
      <KwicToken v-for="(token, i) in row.tokens.slice(0, match.start)" :key="i" :row :token />
    </td>

    <td class="kwic-match px-1 text-center w-0">
      <KwicToken
        v-for="(token, i) in row.tokens.slice(match.start, match.end)"
        :key="i"
        :row
        :token
      />
    </td>

    <td class="ps-0 text-start">
      <KwicToken v-for="(token, i) in row.tokens.slice(match.end)" :key="i" :row :token />
    </td>
  </tr>
</template>
