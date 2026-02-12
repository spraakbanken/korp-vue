<script lang="ts" setup>
import { useLocale } from "@/i18n/useLocale"
import { computedAsync, useToggle } from "@vueuse/core"
import { computed } from "vue"

const COLLAPSED_MAX = 3

const [expanded, toggle] = useToggle()
const { locObj } = useLocale()

const items = computedAsync(async () => {
  const news = await import("@/core/services/news")
  return news.fetchNews()
})
const itemsFiltered = computed(() =>
  expanded.value ? items.value : items.value?.slice(0, COLLAPSED_MAX),
)
</script>

<template>
  <div v-if="itemsFiltered?.length">
    <h4>{{ $t("frontpage.news") }}</h4>

    <article v-for="(item, i) in itemsFiltered" :key="i" class="card mb-2">
      <div class="card-body">
        <h5 class="card-title">{{ locObj(item.title) }}</h5>
        <div class="card-subtitle mb-2 text-muted">
          <time :datetime="item.created">
            {{ item.created }}
          </time>
        </div>
        <div class="card-text" v-html="locObj(item.body)" />
      </div>
    </article>

    <div class="text-center">
      <button
        v-if="items!.length > COLLAPSED_MAX"
        class="btn btn-outline-secondary"
        @click="toggle()"
      >
        {{ expanded ? $t("show_less") : $t("show_more") }}
      </button>
    </div>
  </div>
</template>
