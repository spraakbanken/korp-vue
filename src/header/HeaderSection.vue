<script lang="ts" setup>
import { useAuth } from "../auth/useAuth"
import ModeSelector from "@/header/ModeSelector.vue"
import LanguageSelector from "@/header/LanguageSelector.vue"

const auth = useAuth()
</script>

<template>
  <nav class="navbar navbar-expand">
    <div class="container">
      <ModeSelector />

      <LanguageSelector />

      <component :is="auth?.statusComponent" />
    </div>
  </nav>
</template>
