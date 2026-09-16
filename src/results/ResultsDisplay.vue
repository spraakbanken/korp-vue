<script lang="ts" setup>
import ErrorBox, { type ErrorMessage } from "@/components/ErrorBox.vue"
import { computed, toValue, useTemplateRef, type MaybeRefOrGetter } from "vue"
import type { ResultState } from "./useResult"
import { useElementSize, useTimeout, whenever } from "@vueuse/core"

const props = defineProps<{
  errorMessage: ErrorMessage | undefined
  state: ResultState
  /** Whether the result has hits, i.e. isn't empty */
  populated: MaybeRefOrGetter<boolean>
  progress: number | undefined
}>()

defineEmits<{
  (e: "abort"): void
}>()

/** Controls display of the Abort button when loading takes long */
const showAbortTimeout = useTimeout(3000, { controls: true })
/** Get height of the absolute-positioned working status overlay content */
const { height: statusHeight } = useElementSize(useTemplateRef("working-status"), undefined, {
  box: "border-box",
})

/** The populated prop normalized to a ComputedRef */
const populated = computed(() => toValue(props.populated))
/** Whether state is loading or updating */
const isWorking = computed(() => ["loading", "updating"].includes(props.state))
const showAbort = computed(() => showAbortTimeout.ready.value)

/** Make sure the Abort button shows a while after the request starts loading */
whenever(isWorking, () => showAbortTimeout.start())
</script>

<template>
  <div class="position-relative w-100" :style="{ minHeight: `${statusHeight}px` }">
    <!-- Show error if present -->
    <ErrorBox v-if="errorMessage" v-bind="errorMessage" class="mx-auto mb-0" />

    <!-- Show results if done and not empty -->
    <slot v-if="populated" />

    <!-- Show "no hits" message if done and empty -->
    <div v-if="state == 'done' && !populated" class="alert alert-warning align-self-center">
      {{ $t("result.empty") }}
    </div>

    <!-- Show aborted message if aborted and no old result present-->
    <div v-if="state == 'aborted' && !populated" class="alert alert-warning align-self-center">
      {{ $t("result.aborted") }}
    </div>

    <!-- Status message while request is working -->
    <Transition appear>
      <div
        v-if="isWorking"
        class="position-absolute top-0 bottom-0 w-100 bg-body bg-opacity-50 z-3"
      >
        <div ref="working-status" class="p-5 vstack align-items-center gap-4">
          <!-- Loading spinner -->
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t("loading") }}</span>
          </div>

          <!-- Abort button shown after a while -->
          <Transition appear>
            <button v-if="showAbort" type="button" class="btn btn-danger" @click="$emit('abort')">
              {{ $t("result.abort") }}
            </button>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 200ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
