<script setup lang="ts">
import { formatDecimals } from "@/core/i18n"
import { formatWordOrLemgram, MEASURES, type MatchedRelation } from "@/core/wordpic"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { vPopover } from "@/bootstrap"
import { mapKeys } from "lodash-es"
import type { DependencyRelationMeasure } from "@/core/backend/korp-api"
import { createKeyValueHtml, fromKeys } from "@/core/util"
import { getEmptyValueHtml } from "./formatter"

const { locale, t } = useI18n()

const props = defineProps<{
  row: MatchedRelation
  sort: DependencyRelationMeasure
  showPos?: boolean
}>()

const stats = computed(() => {
  const converters: Record<DependencyRelationMeasure, (x: number) => string> = {
    freq: String,
    freq_relative: (x) => formatDecimals(x, 2),
    mi: (x) => formatDecimals(x, 2),
    rmi: (x) => formatDecimals(x, 2),
  }

  return fromKeys([...MEASURES], (measure) =>
    props.row[measure] != null ? converters[measure](props.row[measure]) : undefined,
  )
})

const valueHtml = computed(() => {
  const { other, other_pos: otherpos, prefix } = props.row
  if (!other) return getEmptyValueHtml(t)
  const main = formatWordOrLemgram(other, otherpos, t, props.showPos)
  return `${prefix || ""} ${main}`
})
</script>

<template>
  <tr>
    <td class="px-1 link" v-html="valueHtml" @click="$emit('clickRow', row)" />
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
  </tr>
</template>
