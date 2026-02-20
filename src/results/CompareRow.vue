<script setup lang="ts">
import type { CompareItem } from "@/core/task/CompareTask"
import { vPopover } from "@/bootstrap"
import { useI18n } from "vue-i18n"
import { formatDecimals } from "@/core/i18n"
import { createKeyValueHtml } from "@/core/util"
import { useStringifiers } from "@/attributes/useStringifiers"
import { computed } from "vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"

const props = defineProps<{
  item: CompareItem
  max: number
  left?: boolean
}>()

defineEmits<{
  (e: "select", item: CompareItem): void
}>()

const { locale } = useI18n()
const getStringifier = useStringifiers()

const valuesHtml = computed(() =>
  props.item.values.flatMap(({ attribute, tokens }) =>
    tokens.map((token) => formatToken(token, attribute)),
  ),
)

const formatToken = (token: string, attribute?: Attribute) =>
  token
    ? attribute
      ? getStringifier(attribute)(token)
      : token
    : "<span class='text-muted'>∅</span>"
</script>

<template>
  <li class="list-group-item position-relative">
    <!-- Background bar -->
    <div
      class="position-absolute h-100 top-0"
      :class="left ? 'bg-info-subtle end-0' : 'bg-warning-subtle start-0'"
      :style="{ width: `${Math.abs(item.loglike / max) * 100}%` }"
    ></div>

    <div class="hstack align-items-baseline position-relative z-1">
      <!-- Value string -->
      <span class="link flex-grow-1" @click="$emit('select', item)" v-html="valuesHtml.join(' ')">
      </span>

      <!-- Frequency -->
      <span
        v-popover
        data-bs-toggle="popover"
        data-bs-trigger="focus hover"
        data-bs-delay="200"
        data-bs-html="true"
        :data-bs-content="
          createKeyValueHtml({
            [$t('stat.freq')]: String(props.item.abs),
            [$t('stat.loglike')]: formatDecimals(Math.abs(props.item.loglike), 2),
          })
        "
        class="text-muted"
        :key="locale"
      >
        {{ item.abs }}
      </span>
    </div>
  </li>
</template>
