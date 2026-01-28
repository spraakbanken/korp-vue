<script setup lang="ts">
import { useConfirmDialog, type UseConfirmDialogReturn } from "@vueuse/core"
import { Modal } from "bootstrap"
import { onMounted, ref } from "vue"

/** Type of the `dialog` passed to the `@setup` event handler. */
export type ConfirmDialog = UseConfirmDialogReturn<void, void, void>

defineProps<{
  /** Modal element id attribute, for use with `data-bs-target` on modal toggle. */
  id?: string
  /** Modal title. */
  title?: string
}>()

const emit = defineEmits<{
  /** Provide dialog handler to parent component. */
  (e: "setup", confirmDialog: UseConfirmDialogReturn<void, void, void>): void
  /** Emitted when the modal is closed, be it via the Bootstrap modal handler or the VueUse confirm dialog handler. */
  (e: "close", confirmed: boolean): void
  /** To use form, add a submit button in the footer and listen to this event. */
  (e: "submit"): void
}>()

const dialog = useConfirmDialog()
const modalRef = ref<HTMLElement>()
let modal: Modal

// Setup handling after mounting, when the modal element ref is available.
onMounted(() => {
  const modalEl = modalRef.value
  if (!modalEl) throw new Error("Login modal element missing")

  // Attach Bootstrap modal handler to the element.
  modal = new Modal(modalEl)

  // Let modal pick up on confirm dialog events.
  dialog.onReveal(() => modal.show())
  dialog.onCancel(() => close(false))
  dialog.onConfirm(() => close(true))

  // Provide dialog handler to parent component.
  emit("setup", dialog)
})

/** Close modal and emit confirmed state. */
function close(confirmed: boolean) {
  modal.hide()
  emit("close", confirmed)
}
</script>

<template>
  <teleport to="body">
    <div
      class="modal modal-lg"
      :id
      ref="modalRef"
      tabindex="-1"
      role="dialog"
      aria-labelledby="login-modal-title"
      aria-hidden="true"
      v-on="{
        // Let confirm dialog handler pick up on modal events.
        'hidden.bs.modal': () => dialog.isRevealed.value && dialog.cancel(),
        'shown.bs.modal': () => dialog.isRevealed.value || dialog.reveal(),
      }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 v-if="title" class="modal-title" id="login-modal-title">
              {{ title }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <form @submit.prevent="$emit('submit')">
            <div class="modal-body">
              <slot />
            </div>

            <div class="modal-footer">
              <slot name="footer">
                <button class="btn btn-primary" @click="dialog.confirm()">{{ $t("ok") }}</button>
              </slot>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>
