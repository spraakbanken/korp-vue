<script setup lang="ts">
import { isCorpusHeading, isKwic, type Row } from "@/core/kwic/kwic"
import KwicToken from "./KwicToken.vue"
import { useLocale } from "@/i18n/useLocale"

defineProps<{ data: Row[] }>()

const { locObj } = useLocale()
</script>

<template>
  <div class="mx-auto" style="width: 40em; max-width: 100%">
    <ul class="list-group list-group-flush">
      <template v-for="(row, i) in data" :key="i">
        <li v-if="isCorpusHeading(row)" class="list-group-item p-4 bg-body-tertiary">
          <h3 class="fs-5 m-0">{{ locObj(row.newCorpus) }}</h3>
        </li>
        <li v-if="isKwic(row)" class="list-group-item p-4">
          <KwicToken v-for="(token, i) in row.tokens" :key="i" :row :token />
        </li>
      </template>
    </ul>
  </div>
</template>
