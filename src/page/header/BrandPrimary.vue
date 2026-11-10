<script setup lang="ts">
import KorpLogo from "@/components/KorpLogo.vue"

const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <a :href="selfUrl">
    <h1 class="m-0"><KorpLogo /></h1>
  </a>
</template>
