<script setup lang="ts">
import type { RelationsSort } from "@/core/backend/types/relations"
import { formatDecimals } from "@/core/i18n"
import { formatWordOrLemgram, type MatchedRelation } from "@/core/wordpic"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { vPopover } from "@/bootstrap"

const { t } = useI18n()

const props = defineProps<{
  row: MatchedRelation
  sort: RelationsSort
  showPos?: boolean
}>()

const stats = computed(() => {
  return {
    freq: String(props.row.freq),
    mi: formatDecimals(props.row.mi, 2),
  }
})

const statsText = computed(() =>
  Object.entries(stats.value)
    .map(([key, value]) => `${t(`stat.${key}`)}: ${value}`)
    .join("<br />"),
)
</script>

<template>
  <tr>
    <td
      class="px-1 link"
      v-html="formatWordOrLemgram(row.other, row.otherpos, $t, props.showPos)"
      @click="$emit('clickRow', row)"
    />
    <td
      v-popover
      data-bs-toggle="popover"
      data-bs-trigger="focus hover"
      :data-bs-content="statsText"
      data-bs-placement="bottom"
      data-bs-delay="200"
      data-bs-html="true"
      class="px-1 ps-2 text-end"
    >
      {{ stats[sort] }}
    </td>
  </tr>
</template>
