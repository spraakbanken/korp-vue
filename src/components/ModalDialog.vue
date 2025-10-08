<script setup lang="ts">
import { useConfirmDialog, type UseConfirmDialogReturn } from '@vueuse/core'
import { onMounted, ref } from 'vue'

export type Dialog = UseConfirmDialogReturn<string | undefined, void, void>

const emit = defineEmits<{
  /** Provide trigger to parent */
  (e: 'setup', dialog: Dialog): void
  (e: 'close', confirmed: boolean): void
}>()

const dialog = useConfirmDialog<string | undefined, void, void>()

const element = ref<HTMLDialogElement>()
const message = ref<string>()

dialog.onReveal((text?: string) => {
  message.value = text
  element.value?.showModal()
})

dialog.onCancel(() => {
  element.value?.close()
  emit('close', false)
})

dialog.onConfirm(() => {
  element.value?.close()
  emit('close', true)
})

onMounted(() => {
  // Provide trigger to parent
  emit('setup', dialog)
})
</script>

<template>
  <teleport to="body">
    <dialog ref="element" closedby="any" @close="dialog.cancel()">
      <div v-if="$slots.header">
        <slot name="header" />
      </div>

      <slot>
        {{ message }}
      </slot>

      <div v-if="$slots.footer">
        <slot name="footer" />
      </div>
    </dialog>
  </teleport>
</template>
