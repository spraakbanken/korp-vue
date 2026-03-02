<script lang="ts" setup>
/** Shows messages from the message store in fixed position on top of the page */
import { storeToRefs } from "pinia"
import useMessageStore, { type Severity } from "./store/useMessageStore"

const messageStore = useMessageStore()
const { messages } = storeToRefs(messageStore)
const { removeMessage } = messageStore

function isProblem(severity: Severity) {
  return ["warning", "error"].includes(severity)
}

function getVariant(severity: Severity) {
  const map: Record<Severity, string> = {
    error: "danger",
    info: "info",
    success: "success",
    warning: "warning",
  }
  return map[severity]
}
</script>

<template>
  <!-- TransitionGroup animates insertion/removal of child elements -->
  <TransitionGroup
    tag="div"
    class="position-fixed start-0 end-0 p-4 d-flex flex-column align-items-center gap-2 z-1 pe-none"
  >
    <div
      v-for="message in messages"
      :key="message.id"
      role="alert"
      class="alert d-flex align-items-center gap-4 shadow-lg pe-auto bg-body border-2"
      :class="`alert-${getVariant(message.severity)}`"
    >
      <div>
        <p v-if="isProblem(message.severity)">{{ $t("error.heading") }}</p>
        <pre class="text-wrap">{{ message.text }}</pre>
        <p v-if="isProblem(message.severity)" class="mb-0">{{ $t("error.footer") }}</p>

        <img
          v-if="isProblem(message.severity)"
          src="@/assets/korp_fail.svg"
          role="presentation"
          class="d-block mx-auto mt-3"
          style="height: 8rem"
        />
      </div>
      <button type="button" class="btn-close" @click="removeMessage(message.id)" />
    </div>
  </TransitionGroup>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
