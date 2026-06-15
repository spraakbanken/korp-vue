<script lang="ts" setup>
import { injectComponent } from "./injection"

const FooterContent = injectComponent("FooterContent")
</script>

<template>
  <footer class="py-5 shadow-sm bg-dark text-light">
    <FooterContent />
  </footer>
</template>
