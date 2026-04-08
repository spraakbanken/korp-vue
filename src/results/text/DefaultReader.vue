<script lang="ts" setup>
import { useLocale } from "@/i18n/useLocale"
import type { ReaderProps } from "./text"
import KwicToken from "../kwic/KwicToken.vue"
import { provide, shallowRef } from "vue"
import type { RowToken } from "@/core/kwic/kwic"
import { injectionKeys } from "@/injection"

const props = defineProps<ReaderProps>()

const { locObj } = useLocale()

const selectedToken = shallowRef<RowToken>()

provide(injectionKeys.selectedToken, selectedToken)
</script>

<template>
  <div>
    <h2>
      {{ locObj(props.corpus.title) }} –
      {{ $t("result.reader.id", { id: props.textId }) }}
    </h2>
    <div style="white-space: pre">
      <KwicToken
        v-for="(token, i) in document.tokens"
        :key="i"
        :rowToken="{ row: document, token }"
      />
    </div>
  </div>
</template>
