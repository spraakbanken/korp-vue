<script lang="ts" setup>
import settings from "@/core/config"
import { useAppStore } from "./store/useAppStore"
import { storeToRefs } from "pinia"
import { useAuth } from "./auth/useAuth"
import { useLocale } from "./i18n/useLocale"

const { locObj } = useLocale()
const store = useAppStore()
const auth = useAuth()

const { lang } = storeToRefs(store)
</script>

<template>
  <header class="container">
    <div>
      {{ $t("modes") }}:
      <span v-for="{ label, mode } of settings.modes" :key="mode">
        <a :href="`?mode=${mode}`">{{ locObj(label) }}</a>
        &nbsp;
      </span>
    </div>

    <div>
      {{ $t("language") }}:
      <label v-for="l in settings.languages" :key="l.value">
        <input type="radio" v-model="lang" :value="l.value" />
        {{ locObj(l.label) }}
      </label>
    </div>

    <div>
      <component :is="auth?.statusComponent" />
    </div>
  </header>
</template>
