<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../useAuth'

const auth = useAuth()

const dialogElement = ref<HTMLDialogElement>()
const name = ref('')
const password = ref('')
const saveLogin = ref(false)
const loading = ref(false)
const errorMessage = ref('')

function showDialog() {
  dialogElement.value?.showModal()
}

async function send() {
  loading.value = true
  try {
    await auth.login(name.value, password.value, saveLogin.value)
  } catch (error) {
    errorMessage.value = String(error)
  } finally {
    loading.value = false
  }
  if (auth?.isLoggedIn()) dialogElement.value?.close()
}

function onClose() {
  errorMessage.value = ''
}
</script>

<template>
  <button v-if="!auth?.isLoggedIn()" @click="showDialog()">Login</button>
  <button v-else @click="auth.logout()">Log out {{ auth.getUsername() }}</button>

  <teleport to="body">
    <dialog ref="dialogElement" closedby="any" @close="onClose">
      <form @submit.prevent="send">
        <input v-model="name" autocomplete="username" />
        <input v-model="password" type="password" autocomplete="current-password" />
        <input v-model="saveLogin" type="checkbox" />
        <input type="submit" value="Log in" />
        <progress v-if="loading" />
        <div v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </dialog>
  </teleport>
</template>
