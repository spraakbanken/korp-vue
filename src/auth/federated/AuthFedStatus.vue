<script setup lang="ts">
import { useAuth } from "../useAuth"

const auth = useAuth()
</script>

<template>
  <button v-if="!auth.isLoggedIn()" type="button" class="nav-link" @click="auth.login()">
    <fa-icon icon="fa-solid fa-arrow-right-to-bracket" />
    {{ $t("auth.login") }}
  </button>
  <button v-else type="button" class="nav-link" @click="auth.logout()">
    <fa-icon icon="fa-solid fa-arrow-right-from-bracket" />
    {{ $t("auth.logout", { name: auth.getUsername() }) }}
  </button>
</template>
