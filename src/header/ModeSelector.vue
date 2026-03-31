<script setup lang="ts">
import settings from "@/core/config"
import currentMode from "@/core/corpora/mode"
import { useLocale } from "@/i18n/useLocale"
import { sortBy } from "lodash-es"
import { computed } from "vue"

const { locObj } = useLocale()

const lists = computed(() => {
  const modes = (settings["modes"] || []).filter((mode) => {
    if (!mode) return false
    if (import.meta.env.PROD && mode.labOnly) return false
    return true
  })

  const limit = settings["visible_modes"] || 0

  // Keep always-visible modes ordered by config, but sort the ones in the menu alphabetically
  const primary = modes.slice(0, limit)
  const secondary = sortBy(modes.slice(limit), (mode) => locObj(mode.label))
  return { primary, secondary }
})

const currentModeLabel = computed(() =>
  locObj(settings["modes"]?.find((mode) => mode.mode == currentMode)?.label),
)
</script>

<template>
  <div class="dropdown">
    <button
      id="mode-dropdown"
      type="button"
      class="nav-link dropdown-toggle"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      {{ currentModeLabel }}
    </button>
    <ul
      role="menu"
      class="dropdown-menu"
      aria-labelledby="mode-dropdown
    "
    >
      <li>
        <h6 class="dropdown-header">{{ $t("gui.modes") }}</h6>
      </li>
      <li v-for="{ mode, label } in lists.primary" :key="mode" role="menuitemradio">
        <a class="dropdown-item" :href="`?mode=${mode}`" :class="{ active: mode == currentMode }">
          {{ locObj(label) }}
        </a>
      </li>
      <li v-if="lists.primary.length && lists.secondary.length">
        <hr class="dropdown-divider" />
      </li>
      <li v-for="{ mode, label } in lists.secondary" :key="mode" role="menuitemradio">
        <a class="dropdown-item" :href="`?mode=${mode}`" :class="{ active: mode == currentMode }">
          {{ locObj(label) }}
        </a>
      </li>
    </ul>
  </div>
</template>
