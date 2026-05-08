<script setup lang="ts">
import settings from "@/core/config"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { storeToRefs } from "pinia"
import { watch } from "vue"
import { useMatomo } from "vue3-matomo"

const store = useAppStore()
const { locObj } = useLocale()
const matomo = useMatomo()

const { lang } = storeToRefs(store)

matomo.value?.trackEvent("UI", "Locale init", lang.value)

watch(lang, () => matomo.value?.trackEvent("UI", "Locale change", lang.value))
</script>

<template>
  <div class="dropdown">
    <button
      class="nav-link dropdown-toggle"
      type="button"
      id="language-dropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      aria-labelledby="gui-language-label"
    >
      <fa-icon icon="fa-solid fa-globe" />
    </button>
    <ul role="menu" class="dropdown-menu dropdown-menu-end" aria-labelledby="language-dropdown">
      <li>
        <h6 id="gui-language-label" class="dropdown-header">{{ $t("gui.language") }}</h6>
      </li>
      <li v-for="{ value, label } in settings.languages" :key="value" role="menuitemradio">
        <a
          class="dropdown-item"
          href="#"
          @click.prevent="lang = value"
          :class="{ active: value == lang }"
        >
          {{ locObj(label) }}
        </a>
      </li>
    </ul>
  </div>
</template>
