<script setup lang="ts">
const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <a :href="selfUrl">
    <KorpLogo />
  </a>
</template>
