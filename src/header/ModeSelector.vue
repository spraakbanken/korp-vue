<script setup lang="ts">
import settings from "@/core/config"
import currentMode from "@/core/corpora/mode"
import { locObj } from "@/core/i18n"
import { remove } from "lodash"

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
    <ul class="list-inline d-inline-block">
      <li v-for="{ label, mode } of primary" :key="mode" class="list-inline-item">
        <a :href="`?mode=${mode}`">{{ locObj(label) }}</a>
        &nbsp;
      </li>
    </ul>
    <div class="dropdown d-inline-block">
      <button
        class="btn btn-link dropdown-toggle align-baseline"
        role="menu"
        type="button"
        id="modes-secondary"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {{ $t("more") }}
      </button>
      <div class="dropdown-menu" aria-labelledby="modes-secondary">
        <a
          v-for="{ label, mode } of secondary"
          :key="mode"
          class="dropdown-item"
          :href="`?mode=${mode}`"
        >
          {{ locObj(label) }}
        </a>
      </div>
    </div>
  </div>
</template>
