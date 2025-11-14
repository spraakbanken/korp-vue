<script setup lang="ts">
import settings from "@/core/config"
import { locObj } from "@/core/i18n"
import { useAppStore } from "@/store/useAppStore"
import { storeToRefs } from "pinia"

const store = useAppStore()

const { lang } = storeToRefs(store)
</script>

<template>
  <fieldset>
    <legend class="visually-hidden">{{ $t("language") }}:</legend>
    <ul class="navbar-nav">
      <li v-for="{ value, label } in settings.languages" :key="value" class="nav-item">
        <a
          class="nav-link"
          href="#"
          @click.prevent="lang = value"
          :class="{ active: value == lang }"
        >
          {{ locObj(label) }}
        </a>
      </li>
    </ul>
  </fieldset>
</template>
