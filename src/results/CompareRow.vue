<script setup lang="ts">
import type { CompareItem } from "@/core/task/CompareTask"
import { vPopover } from "@/bootstrap"
import { useI18n } from "vue-i18n"
import { formatDecimals } from "@/core/i18n"
import { createKeyValueHtml } from "@/core/util"
import { useStringifiers } from "@/attributes/useStringifiers"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import EmptyValue from "./EmptyValue.vue"

const props = defineProps<{
  attributes: Record<string, Attribute>
  item: CompareItem
  max: number
  left?: boolean
}>()

defineEmits<{
  (e: "select", item: CompareItem): void
}>()

const { locale } = useI18n()
const { getStringifier } = useStringifiers()
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
      <span class="link flex-grow-1" @click="$emit('select', item)">
        <div v-for="(tokens, attr) in item.values" :key="attr">
          <template v-for="(token, i) in tokens" :key="i">
            <span
              v-if="attributes[attr] && token"
              v-html="getStringifier(attributes[attr])(token)"
            />
            <span v-else-if="token">{{ token }}</span>
            <EmptyValue v-else />
            {{}}
          </template>
        </div>
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
            [$t('stat.freq')]: $n(props.item.abs),
            [$t('stat.loglike')]: formatDecimals(Math.abs(props.item.loglike), 2),
          })
        "
        class="text-muted"
        :key="locale"
      >
        {{ $n(item.abs) }}
      </span>
    </div>
  </li>
</template>
