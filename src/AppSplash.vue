<script lang="ts" setup>
import type { NewsItem } from "@/core/services/news"
import KorpLogo from "./components/KorpLogo.vue"
import { ref } from "vue"
import { useLocale } from "./i18n/useLocale"

const { locObj } = useLocale()

const maintenanceNews = ref<NewsItem[]>([])

setTimeout(loadMaintenanceNews, 3000)

async function loadMaintenanceNews() {
  const newsService = await import("@/core/services/news")
  const items = await newsService.fetchNews()
  maintenanceNews.value = items.filter((item) => item.tags?.includes("maintenance"))
}
</script>

<template>
  <div
    id="app-splash"
    class="flex-grow-1 container vstack justify-content-center align-items-center text-center"
  >
    <div>
      <KorpLogo class="animate-pulse" style="width: 16rem; max-width: 90cqw" />
      <div class="visually-hidden">{{ $t("loading") }}</div>

      <div v-if="maintenanceNews.length" class="mt-4">
        {{ $t("splash.maintenance_news") }}

        <div
          v-for="(item, i) in maintenanceNews"
          :key="i"
          class="alert alert-warning text-start my-2"
        >
          <h4 class="alert-heading">{{ locObj(item.title) }}</h4>
          <p v-html="locObj(item.body)" class="mb-0" />
        </div>
      </div>
    </div>
  </div>
</template>
