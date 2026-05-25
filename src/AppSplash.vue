<script lang="ts" setup>
import KorpLogo from "./components/KorpLogo.vue"
</script>

<template>
  <div id="app-splash" class="flex-grow-1 vstack justify-content-center text-center animate-pulse">
    <div>
      <KorpLogo class="mb-3 mx-1" style="width: 16rem" />
      <div class="visually-hidden">{{ $t("loading") }}</div>
    </div>
  </div>
</template>
