import { useCounter } from "@vueuse/core"
import { defineStore } from "pinia"
import { readonly, ref } from "vue"

export type Message = {
  severity: Severity
  text: string
}

export type Severity = "error" | "info" | "success" | "warning"

export type MessageWithId = Message & { id: number }

/**
 * A store for errors and other messages.
 *
 * These are shown by AppMessages.vue layered on top of other content, so use it sparingly.
 * As far as possible, catch errors locally and show messages close to the elements concerned instead.
 */
export default defineStore("message", () => {
  const messages = ref<MessageWithId[]>([])
  const counter = useCounter()

  const addMessage = (severity: Severity, text: string) => {
    messages.value.push({ severity, text, id: counter.inc() })
  }

  const removeMessage = (id: number) => {
    messages.value = messages.value.filter((msg) => msg.id !== id)
  }

  return {
    messages: readonly(messages),
    addMessage,
    removeMessage,
  }
})
