<script setup lang="ts">
import { useDark } from "./useDark"
import korpLogo from "@/assets/korp.svg"
import korpLogoLight from "@/assets/korp-light.svg"

const isDark = useDark()
</script>

<template>
  <img :src="isDark ? korpLogoLight : korpLogo" alt="Korp logo" />
</template>
