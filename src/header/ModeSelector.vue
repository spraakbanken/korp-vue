<script setup lang="ts">
import settings from "@/core/config"
import currentMode from "@/core/corpora/mode"
import { useLocale } from "@/i18n/useLocale"
import { remove, sortBy } from "lodash-es"
import { computed } from "vue"

const { locObj } = useLocale()

const N_VISIBLE = settings["visible_modes"] || 5
const modes = settings["modes"].filter((mode) => {
  if (!mode) return false
  if (import.meta.env.PROD && mode.labOnly) return false
  return true
})

const lists = computed(() => {
  // Keep always-visible modes ordered by config, but sort the ones in the menu alphabetically
  const primary = modes.slice(0, N_VISIBLE)
  const secondary = sortBy(modes.slice(N_VISIBLE), (mode) => locObj(mode.label))

  // Move current secondary mode up as an extra primary
  const currentModeInSecondary = remove(secondary, (mode) => mode.mode == currentMode)
  if (currentModeInSecondary.length) primary.push(...currentModeInSecondary)

  return { primary, secondary }
})
</script>

<template>
  <div>
    <span class="visually-hidden">{{ $t("modes") }}:</span>
    <ul class="navbar-nav">
      <li v-for="{ label, mode } of lists.primary" :key="mode" class="nav-item">
        <a :href="`?mode=${mode}`" class="nav-link" :class="{ active: mode == currentMode }">
          {{ locObj(label) }}
        </a>
      </li>

      <li class="nav-item dropdown">
        <a
          id="modes-secondary"
          class="nav-link dropdown-toggle"
          href="#"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {{ $t("more") }}
        </a>
        <ul class="dropdown-menu" aria-labelledby="modes-secondary">
          <li v-for="{ label, mode } of lists.secondary" :key="mode">
            <a :href="`?mode=${mode}`" class="dropdown-item">
              {{ locObj(label) }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
