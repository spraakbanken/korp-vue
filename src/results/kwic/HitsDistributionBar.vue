<script setup lang="ts">
import type { HitsDistribution } from "@/core/backend/proxy/QueryProxyBase"
import { corpusListing } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { sumBy } from "lodash-es"
import { computed } from "vue"
import { vPopover } from "@/bootstrap"

const props = defineProps<{
  distribution: HitsDistribution[]
  hpp: number
}>()

defineEmits<{
  (e: "selectPage", page: number): void
}>()

const { locObj } = useLocale()

const items = computed(() => {
  const total = sumBy(props.distribution, "hits")
  let acc = 0
  return props.distribution.map((item) => {
    const page = Math.floor(acc / props.hpp) + 1
    acc += item.hits
    return {
      corpus: corpusListing.get(item.corpus),
      hits: item.hits,
      id: item.corpus,
      page,
      percentage: (item.hits / total) * 100,
    }
  })
})
</script>

<template>
  <div class="btn-group text-nowrap">
    <a
      v-for="item in items"
      :key="item.id"
      href="#"
      class="btn btn-sm btn-outline-secondary overflow-hidden px-1"
      :style="{ width: `${item.percentage}%` }"
      v-popover
      data-bs-toggle="popover"
      data-bs-trigger="hover"
      data-bs-placement="top"
      data-bs-html="true"
      :data-bs-title="`${$t('result.kwic.distribution.goto', { page: item.page })}`"
      :data-bs-content="`
        <div><strong>${$t('corpus')}:</strong> ${locObj(item.corpus.title)}</div>
        <div><strong>${$t('result.kwic.hits_count')}:</strong> ${$n(item.hits)}</div>
        `"
      @click.prevent="$emit('selectPage', item.page)"
    >
      <span>{{ locObj(item.corpus.title) }}</span>
    </a>
  </div>
</template>
