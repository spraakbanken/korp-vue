<script setup lang="ts">
import { ref } from "vue"
import { useAuth } from "../useAuth"
import { attemptLogin } from "."
import ModalDialog, { type Dialog } from "@/components/ModalDialog.vue"

const auth = useAuth()

const dialog = ref<Dialog>()
const name = ref("")
const password = ref("")
const saveLogin = ref(false)
const loading = ref(false)
const errorMessage = ref("")

async function send() {
  loading.value = true
  try {
    await auth.login(name.value, password.value, saveLogin.value)
  } catch (error) {
    errorMessage.value = String(error)
  } finally {
    loading.value = false
  }
  if (auth?.isLoggedIn()) dialog.value?.confirm()
}

function onClose() {
  errorMessage.value = ""
}

attemptLogin.onStart(async () => void (await dialog.value?.reveal()))
</script>

<template>
  <button v-if="!auth?.isLoggedIn()" @click="dialog?.reveal()">Login</button>
  <button v-else @click="auth.logout()">Log out {{ auth.getUsername() }}</button>

  <ModalDialog @setup="dialog = $event" @close="onClose">
    <form @submit.prevent="send">
      <input v-model="name" autocomplete="username" />
      <input v-model="password" type="password" autocomplete="current-password" />
      <input v-model="saveLogin" type="checkbox" />
      <input type="submit" value="Log in" />
      <progress v-if="loading" />
      <div v-if="errorMessage">{{ errorMessage }}</div>
    </form>
  </ModalDialog>
</template>
