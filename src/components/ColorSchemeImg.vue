<script setup lang="ts">
defineProps<{
  /** Image source for dark color scheme. */
  darkSrc: string
  /** Image source for light color scheme. */
  lightSrc: string
}>()
</script>

<template>
  <!-- Wrap img with picture+source to select file depending on light/dark mode -->
  <picture>
    <source media="(prefers-color-scheme: dark)" :srcset="darkSrc" />
    <!-- Let any attrs fall through to the img element -->
    <img :src="lightSrc" v-bind="$attrs" />
  </picture>
</template>
