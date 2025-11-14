<script lang="ts" setup>
import settings from "@/core/config"
import { useAppStore } from "../store/useAppStore"
import { storeToRefs } from "pinia"
import { useAuth } from "../auth/useAuth"
import { useLocale } from "../i18n/useLocale"
import ModeSelector from "@/header/ModeSelector.vue"

const { locObj } = useLocale()
const store = useAppStore()
const auth = useAuth()

const { lang } = storeToRefs(store)
</script>

<template>
  <header class="container">
    <ModeSelector />

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
