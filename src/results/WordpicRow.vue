<script setup lang="ts">
import type { RelationsSort } from "@/core/backend/types/relations"
import { formatDecimals } from "@/core/i18n"
import { formatStats, formatWordOrLemgram, type MatchedRelation } from "@/core/wordpic"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { vPopover } from "@/bootstrap"
import { mapKeys } from "lodash-es"
import { createKeyValueHtml } from "@/core/util"
import { getEmptyValueHtml } from "./formatter"

const { locale, t } = useI18n()

const props = defineProps<{
  row: MatchedRelation
  prevRow?: MatchedRelation
  sort: RelationsSort
  showPos?: boolean
}>()

const stats = computed(() => formatStats(props.row))
const prevStats = computed(() => (props.prevRow ? formatStats(props.prevRow) : undefined))

const valueHtml = computed(() =>
  props.row.other
    ? formatWordOrLemgram(props.row.other, props.row.otherpos, t, props.showPos)
    : getEmptyValueHtml(t),
)

const changeMarker = computed(() => {
  if (!props.prevRow) return "" // No previous period data
  const delta = props.row[props.sort] - props.prevRow[props.sort]
  if (delta > 0) return "↗"
  if (delta < 0) return "↘"
  return "=" // No change
})
</script>

<template>
  <tr>
    <!-- Related word -->
    <td class="px-1 link" v-html="valueHtml" @click="$emit('clickRow', row)" />

    <!-- Stats figure -->
    <td
      v-popover
      data-bs-toggle="popover"
      data-bs-trigger="focus hover"
      :data-bs-content="createKeyValueHtml(mapKeys(stats, (_, key) => $t(`stat.${key}`)))"
      data-bs-placement="bottom"
      data-bs-delay="200"
      data-bs-html="true"
      class="px-1 ps-2 text-end"
      :key="locale"
    >
      {{ stats[sort] }}
    </td>

    <!-- Previous period -->
    <td
      v-if="prevStats"
      v-popover
      data-bs-toggle="popover"
      data-bs-trigger="focus hover"
      :data-bs-content="
        $t('result.wordpic.period.stat_comparison', {
          key: $t(`stat.${sort}`),
          value: prevStats[sort],
        })
      "
      data-bs-placement="bottom"
      data-bs-delay="200"
      class="px-1"
      :key="`${locale}-prev`"
    >
      {{ changeMarker }}
    </td>
    <td v-else />
  </tr>
</template>
