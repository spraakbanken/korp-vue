<script setup lang="ts">
import { ref } from "vue"
import KwicRow from "./KwicRow.vue"
import { isCorpusHeading, isKwic, type Row } from "@/core/kwic/kwic"
import { watchImmediate } from "@vueuse/core"
import { useLocale } from "@/i18n/useLocale"
import vScrollToTarget from "@/components/vScrollToTargetOn"

const props = defineProps<{ data: Row[] }>()

const { locObj } = useLocale()

/** Counter to trigger re-render when data changes */
const dataCounter = ref(0)

// TODO Select first match token
watchImmediate(
  () => props.data,
  () => dataCounter.value++,
)
</script>

<template>
  <div class="w-100 overflow-x-auto" v-scroll-to-target="{ watch: data, selector: '.kwic-match' }">
    <table class="table table-sm text-nowrap">
      <tbody>
        <template v-for="(row, i) in data" :key="`${dataCounter} ${i}`">
          <tr v-if="isCorpusHeading(row)">
            <td class="bg-body-tertiary" />
            <td colspan="2" class="bg-body-tertiary">
              <h3 class="fs-5 my-1">{{ locObj(row.newCorpus) }}</h3>
            </td>
          </tr>

          <KwicRow v-if="isKwic(row)" :row />
        </template>
      </tbody>
    </table>
  </div>
</template>
