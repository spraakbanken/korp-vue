<script setup lang="ts">
import { useAuth } from "../useAuth"

const auth = useAuth()
</script>

<template>
  <button v-if="!auth.isLoggedIn()" @click="auth.login()">Log in</button>
  <button v-else @click="auth.logout()">Log out {{ auth.getUsername() }}</button>
</template>
