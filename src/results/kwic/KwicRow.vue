<script setup lang="ts">
import type { KwicRow } from "@/core/kwic/kwic"
import KwicToken from "./KwicToken.vue"

const props = defineProps<{ row: KwicRow }>()

// Assume there is only one match, otherwise `KwicList` should be used
const match = props.row.match[0]!
</script>

<template>
  <tr>
    <td class="pe-0 text-end" :class="{ 'border-bottom-0': props.row.aligned }">
      <KwicToken
        v-for="(token, i) in row.tokens.slice(0, match.start)"
        :key="i"
        :row-token="{ row, token }"
      />
    </td>

    <td class="kwic-match px-1 text-center w-0" :class="{ 'border-bottom-0': props.row.aligned }">
      <KwicToken
        v-for="(token, i) in row.tokens.slice(match.start, match.end)"
        :key="i"
        :row-token="{ row, token }"
      />
    </td>

    <td class="ps-0 text-start" :class="{ 'border-bottom-0': props.row.aligned }">
      <KwicToken
        v-for="(token, i) in row.tokens.slice(match.end)"
        :key="i"
        :row-token="{ row, token }"
      />
    </td>
  </tr>
</template>
