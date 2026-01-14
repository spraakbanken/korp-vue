<script setup lang="ts">
import { isKwic, type Row } from "@/core/kwic/kwic"
import KwicToken from "./KwicToken.vue"

defineProps<{ data: Row[] }>()
</script>

<template>
  <div class="mx-auto" style="width: 40em; max-width: 100%">
    <ul class="list-group">
      <li v-for="(row, i) in data" :key="i" class="list-group-item p-4">
        <div v-if="isKwic(row)">
          <KwicToken v-for="(token, i) in row.tokens" :key="i" :row :token />
        </div>
      </li>
    </ul>
  </div>
</template>
