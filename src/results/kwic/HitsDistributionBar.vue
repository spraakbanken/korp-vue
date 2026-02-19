<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { HitsDistribution } from "@/core/backend/proxy/QueryProxyBase"
import { corpusListing } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { sumBy } from "lodash-es"
import { computed } from "vue"
import { vPopover } from "@/bootstrap"
import { createKeyValueHtml } from "@/core/util"

const page = defineModel<number>({ default: 1 })

const props = defineProps<{
  distribution: HitsDistribution[]
  hpp: number
}>()

const { locale } = useI18n()
const { locObj } = useLocale()

const total = computed(() => sumBy(props.distribution, (item) => item.hits))
const pagePercentage = computed(() => (((page.value - 1) * props.hpp) / total.value) * 100)

const items = computed(() => {
  let acc = 0
  return props.distribution.map((item) => {
    const page = Math.floor(acc / props.hpp) + 1
    acc += item.hits
    return {
      corpus: corpusListing.get(item.corpus),
      hits: item.hits,
      id: item.corpus,
      page,
      percentage: (item.hits / total.value) * 100,
    }
  })
})
</script>

<template>
  <div class="position-relative overflow-hidden">
    <!-- Current-page marker-->
    <div
      class="position-absolute top-0 bottom-0 bg-primary-subtle"
      :style="{
        width: `${(hpp / total) * 100}%`,
        minWidth: '2px',
        left: `${pagePercentage}%`,
      }"
    ></div>

    <!-- Percentage-sized buttons -->
    <nav class="w-100 btn-group text-nowrap">
      <a
        v-for="item in items"
        :key="item.id + locale"
        href="#"
        class="btn btn-sm btn-outline-secondary overflow-hidden px-0"
        :style="{ width: `${item.percentage}%` }"
        v-popover
        data-bs-toggle="popover"
        data-bs-trigger="hover"
        data-bs-placement="top"
        data-bs-html="true"
        :data-bs-title="`${$t('result.kwic.distribution.goto', { page: item.page })}`"
        :data-bs-content="
          createKeyValueHtml({
            [$t('corpus')]: locObj(item.corpus.title),
            [$t('result.kwic.hits_count')]: $n(item.hits),
          })
        "
        @click.prevent="page = item.page"
      >
        <span class="mx-1">{{ locObj(item.corpus.title) }}</span>
      </a>
    </nav>
  </div>
</template>
