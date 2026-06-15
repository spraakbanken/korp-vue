<script lang="ts" setup>
import settings from "@/core/config"
import { useLocale } from "@/i18n/useLocale"
import { computed } from "vue"

const { locObj } = useLocale()

const helpLinks = computed(() => settings.navigation?.help_links || [])
</script>

<template>
  <div v-if="helpLinks.length" class="dropdown">
    <button
      id="help-dropdown"
      type="button"
      class="nav-link dropdown-toggle"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      aria-labelledby="gui-help-label"
    >
      <fa-icon icon="fa-regular fa-circle-question" />
    </button>

    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="help-dropdown">
      <li>
        <h6 id="gui-help-label" class="dropdown-header">{{ $t("nav.help") }}</h6>
      </li>

      <li v-for="({ url, label, title }, i) in helpLinks" :key="i">
        <a
          :href="locObj(url)"
          target="_blank"
          :title="locObj(title)"
          class="dropdown-item hstack justify-content-between"
        >
          {{ locObj(label) }}
          <fa-icon icon="fa-solid fa-arrow-up-right-from-square" size="xs" class="ms-2" />
        </a>
      </li>
    </ul>
  </div>
</template>
