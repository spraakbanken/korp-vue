<script setup lang="ts">
import settings from "@/core/config"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { storeToRefs } from "pinia"

const store = useAppStore()
const { locObj } = useLocale()

const { lang } = storeToRefs(store)
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
