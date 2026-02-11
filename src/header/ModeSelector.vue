<script setup lang="ts">
import settings from "@/core/config"
import currentMode from "@/core/corpora/mode"
import { useLocale } from "@/i18n/useLocale"
import { remove } from "lodash-es"

const { locObj } = useLocale()

const N_VISIBLE = settings["visible_modes"] || 5
const modes = settings["modes"].filter((mode) => {
  if (!mode) return false
  if (import.meta.env.PROD && mode.labOnly) return false
  return true
})
const primary = modes.slice(0, N_VISIBLE)
const secondary = modes.slice(N_VISIBLE)

// Promote current secondary mode to primary
const currentModeInSecondary = remove(secondary, (mode) => mode.mode == currentMode)
if (currentModeInSecondary.length) primary.push(...currentModeInSecondary)
</script>

<template>
  <div>
    <span class="visually-hidden">{{ $t("modes") }}:</span>
    <ul class="navbar-nav">
      <li v-for="{ label, mode } of primary" :key="mode" class="nav-item">
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
          <li v-for="{ label, mode } of secondary" :key="mode">
            <a :href="`?mode=${mode}`" class="dropdown-item">
              {{ locObj(label) }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
