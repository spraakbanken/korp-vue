<script setup lang="ts">
import KorpLogo from "@/components/KorpLogo.vue"

const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <a :href="selfUrl">
    <KorpLogo />
  </a>
</template>
