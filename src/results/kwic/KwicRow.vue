<script setup lang="ts">
import type { ApiKwic } from "@/core/api/types"

defineProps<{ data: ApiKwic }>()
</script>

<template>
  <tr v-if="!Array.isArray(data.match)">
    <td>
      <template v-for="(token, i) in data.tokens.slice(0, data.match.start)" :key="i">
        {{ token.word }}
      </template>
    </td>
    <td class="kwic-match">
      <strong>
        <template
          v-for="(token, i) in data.tokens.slice(data.match.start, data.match.end)"
          :key="i"
        >
          {{ token.word }}
        </template>
      </strong>
    </td>
    <td>
      <template v-for="(token, i) in data.tokens.slice(data.match.end)" :key="i">
        {{ token.word }}
      </template>
    </td>
  </tr>
</template>
