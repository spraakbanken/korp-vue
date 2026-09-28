<script setup lang="ts">
import { useDark } from "@/components/useDark"
import { useMatomo } from "vue3-matomo"

const isDark = useDark()
const matomo = useMatomo()

function toggleDark() {
  matomo.value?.trackEvent("UI", "Dark mode change", isDark.value ? "dark" : "light")
  isDark.value = !isDark.value
}
</script>

<template>
  <button
    type="button"
    :title="$t('gui.color_mode')"
    class="nav-link btn btn-link"
    @click="toggleDark()"
  >
    <fa-icon icon="fas fa-circle-half-stroke" />
    <span class="visually-hidden">{{ $t("gui.color_mode") }}</span>
  </button>
</template>
