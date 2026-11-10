<script setup lang="ts">
import { ref } from "vue"
import KwicRow from "./KwicRow.vue"
import { isCorpusHeading, isKwic, isLinkedKwic, type Row } from "@/core/kwic/kwic"
import { watchImmediate } from "@vueuse/core"
import { useLocale } from "@/i18n/useLocale"
import vScrollToTarget from "@/components/vScrollToTarget"
import KwicRowLinked from "./KwicRowLinked.vue"
import settings from "@/core/config"

const props = defineProps<{ data: Row[] }>()

const { locObj } = useLocale()

/** Counter to trigger re-render when data changes */
const dataCounter = ref(0)

watchImmediate(
  () => props.data,
  () => dataCounter.value++,
)
</script>

<template>
  <div
    class="w-100 overflow-x-auto"
    v-scroll-to-target="{ watch: () => data, selector: '.kwic-match' }"
  >
    <table class="table table-sm text-nowrap" :dir="settings.dir">
      <thead class="visually-hidden">
        <tr>
          <th scope="col">{{ $t("result.kwic.column.before") }}</th>
          <th scope="col">{{ $t("result.kwic.column.match") }}</th>
          <th scope="col">{{ $t("result.kwic.column.after") }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, i) in data" :key="`${dataCounter} ${i}`">
          <tr v-if="isCorpusHeading(row)">
            <th colspan="3" class="bg-body-tertiary p-1">
              <h3 class="d-inline-block position-sticky start-50 translate-middle-x my-1 fs-5">
                {{ locObj(row.newCorpus) }}
              </h3>
            </th>
          </tr>

          <KwicRow v-if="isKwic(row)" :row />
          <KwicRowLinked v-if="isLinkedKwic(row)" :row />
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Copy Bootstrap's cell selector, decrease padding */
table > :not(caption) > * > * {
  padding: 0.1rem;
}
</style>
