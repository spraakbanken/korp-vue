<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useAuth } from "../useAuth"
import { attemptLogin } from "./common"
import { Modal } from "bootstrap"

const auth = useAuth()

const modalRef = ref<HTMLElement>()
const name = ref("")
const password = ref("")
const saveLogin = ref(false)
const loading = ref(false)
const errorMessage = ref("")
let modalHandler: Modal | undefined

onMounted(() => {
  const modalEl = modalRef.value
  if (!modalEl) throw new Error("Login modal element missing")
  // Attach Bootstrap modal handler.
  modalHandler = new Modal(modalEl)
  // Reset error message when closed.
  modalEl.addEventListener("hidden.bs.modal", () => (errorMessage.value = ""))
})

// Show modal when login is requested from elsewhere in the app.
attemptLogin.onStart(async () => modalHandler?.show())

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
  if (auth?.isLoggedIn()) modalHandler?.hide()
}
</script>

<template>
  <button
    v-if="!auth?.isLoggedIn()"
    class="btn btn-link align-baseline"
    data-bs-toggle="modal"
    data-bs-target="#login-modal"
  >
    {{ $t("auth.login") }}
  </button>
  <button v-else class="btn btn-link align-baseline" @click="auth.logout()">
    {{ $t("auth.logout", { name: auth.getUsername() }) }}
  </button>

  <!-- Modal triggered by login button -->
  <teleport to="body">
    <div
      class="modal modal-lg"
      id="login-modal"
      ref="modalRef"
      tabindex="-1"
      role="dialog"
      aria-labelledby="login-modal-title"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="login-modal-title">{{ $t("auth.login") }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <form @submit.prevent="send">
            <div class="modal-body">
              <p>{{ $t("auth.description") }}</p>

              <div class="row mb-2">
                <div class="col">
                  <label class="form-label" for="auth-basic-email">{{ $t("auth.email") }} </label>
                  <input
                    id="auth-basic-email"
                    class="form-control"
                    v-model="name"
                    autocomplete="username"
                  />
                </div>

                <div class="col">
                  <label class="form-label" for="auth-basic-password"
                    >{{ $t("auth.password") }}
                  </label>
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
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">{{ $t("auth.login") }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>
