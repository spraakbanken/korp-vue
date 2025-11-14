<script lang="ts" setup>
import settings from "@/core/config"
import { useAppStore } from "../store/useAppStore"
import { storeToRefs } from "pinia"
import { useAuth } from "../auth/useAuth"
import { useLocale } from "../i18n/useLocale"
import ModeSelector from "@/header/ModeSelector.vue"
import InlineMenu from "@/components/InlineMenu.vue"

const { locObj } = useLocale()
const store = useAppStore()
const auth = useAuth()

const { lang } = storeToRefs(store)

const languages = settings.languages.map((item) => ({ ...item, label: locObj(item.label) }))
</script>

<template>
  <header class="container">
    <ModeSelector class="d-inline-block" />

    <InlineMenu
      id="language-selector"
      :label="$t('language')"
      name="lang"
      :options="languages"
      v-model="lang"
      class="d-inline-block align-baseline"
    />

    <component :is="auth?.statusComponent" class="d-inline-block align-baseline" />
  </header>
</template>
