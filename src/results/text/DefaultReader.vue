<script lang="ts" setup>
import { useLocale } from "@/i18n/useLocale"
import type { ReaderProps } from "./text"

const props = defineProps<ReaderProps>()

const { locObj } = useLocale()
</script>

<template>
  <div>
    <h2>
      {{ locObj(props.corpus.title) }} –
      {{ $t("result.reader.id", { id: props.sentence["text__id"] }) }}
    </h2>
    <div style="white-space: pre">
      <span v-for="(token, i) in document.tokens" :key="i"
        >{{ token.attrs.head }}{{ token.attrs.word }}{{ token.attrs.tail }}</span
      >
    </div>
  </div>
</template>
