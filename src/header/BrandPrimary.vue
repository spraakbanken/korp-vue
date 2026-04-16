<script setup lang="ts">
import ColorSchemeImg from "@/components/ColorSchemeImg.vue"
import korpLogo from "@/assets/korp.svg"
import korpLogoLight from "@/assets/korp-light.svg"

const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <a :href="selfUrl">
    <ColorSchemeImg :dark-src="korpLogoLight" :light-src="korpLogo" alt="Korp Logo" />
  </a>
</template>
