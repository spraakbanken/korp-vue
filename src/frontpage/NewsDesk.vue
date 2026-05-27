<script lang="ts" setup>
import { useLocale } from "@/i18n/useLocale"
import { computedAsync, useToggle } from "@vueuse/core"
import { computed } from "vue"

const COLLAPSED_MAX = 3

const [expanded, toggle] = useToggle()
const { locObj, locDate } = useLocale()

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

    <div class="d-flex flex-wrap gap-4">
      <article
        v-for="(item, i) in itemsFiltered"
        :key="i"
        class="flex-grow-1"
        :class="{
          'bg-warning-subtle': item.tags?.includes('maintenance'),
        }"
        style="width: 18rem"
      >
        <div class="card-body">
          <h5 class="card-title">{{ locObj(item.title) }}</h5>
          <div class="card-subtitle text-muted">
            <time :datetime="item.created">
              {{ locDate(item.created) }}
            </time>
          </div>
          <div class="card-text mt-2" v-html="locObj(item.body)" />
        </div>
      </article>
    </div>

    <div class="mt-2 text-center">
      <button
        v-if="items!.length > COLLAPSED_MAX"
        class="btn btn-outline-secondary"
        @click="toggle()"
      >
        <fa-icon :icon="`fa-solid ${expanded ? 'fa-angles-up' : 'fa-angles-down'}`" />
        {{ expanded ? $t("show_less") : $t("show_more") }}
      </button>
    </div>
  </div>
</template>
