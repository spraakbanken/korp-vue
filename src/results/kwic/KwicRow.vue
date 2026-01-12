<script setup lang="ts">
import type { Token } from "@/core/backend/types"
import KwicToken from "./KwicToken.vue"
import { isKwic, type Row } from "@/core/kwic/kwic"

defineProps<{ data: Row }>()

defineEmits<{
  (e: "selectToken", token: Token): void
}>()
</script>

<template>
  <tr v-if="isKwic(data) && !Array.isArray(data.match)">
    <td class="pe-0">
      <div class="d-flex justify-content-end">
        <KwicToken
          v-for="(token, i) in data.tokens.slice(0, data.match.start)"
          :key="i"
          :token
          @click="$emit('selectToken', token)"
        />
      </div>
    </td>

    <td class="kwic-match px-0">
      <div class="d-flex justify-content-center">
        <KwicToken
          v-for="(token, i) in data.tokens.slice(data.match.start, data.match.end)"
          :key="i"
          :token
          @click="$emit('selectToken', token)"
        />
      </div>
    </td>

    <td class="ps-0">
      <div class="d-flex justify-content-start">
        <KwicToken
          v-for="(token, i) in data.tokens.slice(data.match.end)"
          :key="i"
          :token
          @click="$emit('selectToken', token)"
        />
      </div>
    </td>
  </tr>

  <tr v-else>
    (TODO non-KWIC row)
  </tr>
</template>
