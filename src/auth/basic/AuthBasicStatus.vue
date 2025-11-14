<script setup lang="ts">
import { ref } from "vue"
import { useAuth } from "../useAuth"
import { attemptLogin } from "./common"
import ModalDialog, { type ConfirmDialog } from "@/components/ModalDialog.vue"

const auth = useAuth()

const name = ref("")
const password = ref("")
const saveLogin = ref(false)
const loading = ref(false)
const errorMessage = ref("")
let dialog: ConfirmDialog | undefined

// Show modal when login is requested from elsewhere in the app.
attemptLogin.onStart(async () => void (await dialog?.reveal()))

// Login form submit handler.
async function send() {
  loading.value = true
  try {
    await auth.login(name.value, password.value, saveLogin.value)
  } catch (error) {
    errorMessage.value = String(error)
  } finally {
    loading.value = false
  }
  if (auth?.isLoggedIn()) dialog?.confirm()
}
</script>

<template>
  <button
    v-if="!auth?.isLoggedIn()"
    class="nav-link"
    data-bs-toggle="modal"
    data-bs-target="#auth-basic-modal"
  >
    {{ $t("auth.login") }}
  </button>
  <button v-else class="nav-link" @click="auth.logout()">
    {{ $t("auth.logout", { name: auth.getUsername() }) }}
  </button>

  <!-- Modal triggered by login button -->
  <ModalDialog
    id="auth-basic-modal"
    :title="$t('auth.login')"
    @setup="dialog = $event"
    @close="errorMessage = ''"
    @submit="send()"
  >
    <p>{{ $t("auth.description") }}</p>

    <div class="row mb-2">
      <div class="col">
        <label class="form-label" for="auth-basic-email">{{ $t("auth.email") }} </label>
        <input id="auth-basic-email" class="form-control" v-model="name" autocomplete="username" />
      </div>

      <div class="col">
        <label class="form-label" for="auth-basic-password">{{ $t("auth.password") }} </label>
        <input
          id="auth-basic-password"
          type="password"
          class="form-control"
          v-model="password"
          autocomplete="current-password"
          aria-describedby="auth-basic-password-help"
        />
        <div id="auth-basic-password-help" class="form-text">
          <a href="https://ws.spraakbanken.gu.se/user/password" target="_blank">
            {{ $t("auth.password.forgotten") }}
          </a>
        </div>
      </div>
    </div>

    <div class="form-check">
      <input
        id="auth-basic-remember"
        type="checkbox"
        class="form-check-input"
        v-model="saveLogin"
      />
      <label class="form-check-label" for="auth-basic-remember">
        {{ $t("auth.remember") }}
      </label>
    </div>

    <progress v-if="loading" />
    <div v-if="errorMessage">{{ errorMessage }}</div>

    <template #footer>
      <button type="submit" class="btn btn-primary">{{ $t("auth.login") }}</button>
    </template>
  </ModalDialog>
</template>
