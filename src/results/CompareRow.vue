<script setup lang="ts">
import { vPopover } from "@/bootstrap"
import { useI18n } from "vue-i18n"
import type { LogLikelihoodRow } from "@/core/backend/korp-api"
import { formatDecimals } from "@/core/i18n"
import { createKeyValueHtml } from "@/core/util"
import { useStringifiers } from "@/attributes/useStringifiers"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"
import EmptyValue from "./EmptyValue.vue"

const props = defineProps<{
  attributes: Record<string, Attribute>
  item: LogLikelihoodRow
  max: number
  left?: boolean
}>()

defineEmits<{
  (e: "select", item: LogLikelihoodRow): void
}>()

const { locale } = useI18n()
const { getStringifier } = useStringifiers()

const getFrequency = () => (props.item.score < 0 ? props.item.set1 : props.item.set2)
</script>

<template>
  <li class="list-group-item position-relative">
    <!-- Background bar -->
    <div
      class="position-absolute h-100 top-0"
      :class="left ? 'bg-info-subtle end-0' : 'bg-warning-subtle start-0'"
      :style="{ width: `${Math.abs(item.score / max) * 100}%` }"
    ></div>

    <div class="hstack align-items-baseline position-relative z-1">
      <!-- Value string -->
      <span class="link flex-grow-1" @click="$emit('select', item)">
        <div v-for="(tokens, attr) in item.value" :key="attr">
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
            [$t('stat.freq')]: $n(getFrequency()),
            [$t('stat.loglike')]: formatDecimals(Math.abs(item.score), 2),
          })
        "
        class="text-muted"
        :key="locale"
      >
        {{ $n(getFrequency()) }}
      </span>
    </div>
  </li>
</template>
