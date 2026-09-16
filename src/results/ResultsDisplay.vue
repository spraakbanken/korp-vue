<script lang="ts" setup>
import ErrorBox from "@/components/ErrorBox.vue"
import { computed, inject, toValue, useTemplateRef, type MaybeRefOrGetter } from "vue"
import { resultKeys } from "./useResult"
import { useElementSize, useTimeout, whenever } from "@vueuse/core"
import TransitionFade from "@/components/TransitionFade.vue"

const props = defineProps<{
  /** Whether the progress percentage is expected to change while loading */
  incremental?: boolean
  /** Whether the result has hits, i.e. isn't empty */
  populated: MaybeRefOrGetter<boolean>
}>()

/** Controls display of the Abort button when loading takes long */
const showAbortTimeout = useTimeout(3000, { controls: true })
/** Get height of the absolute-positioned working status overlay content */
const { height: statusHeight } = useElementSize(useTemplateRef("working-status"), undefined, {
  box: "border-box",
})

const error = inject(resultKeys.error)
const progress = inject(resultKeys.progress)
const state = inject(resultKeys.state)
const abort = inject(resultKeys.abort)

/** The populated prop normalized to a ComputedRef */
const populated = computed(() => toValue(props.populated))
const showAbort = computed(() => showAbortTimeout.ready.value)

/** Make sure the Abort button shows a while after the request starts loading */
whenever(
  () => state?.value == "loading",
  () => showAbortTimeout.start(),
)
</script>

<template>
  <div class="position-relative w-100" :style="{ minHeight: `${statusHeight}px` }">
    <!-- Show error if present -->
    <ErrorBox v-if="error" v-bind="error" class="mx-auto mb-0" />

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
    <TransitionFade>
      <div
        v-if="state == 'loading'"
        class="position-absolute top-0 bottom-0 w-100 bg-body bg-opacity-50 z-3 pe-none"
      >
        <div ref="working-status" class="p-5 vstack align-items-center gap-4">
          <!-- Progress bar -->
          <div
            v-if="incremental"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
            class="progress progress-bar-striped progress-bar-animated pe-auto"
            style="width: 10rem"
          >
            <div
              class="progress-bar progress-bar-striped progress-bar-animated"
              :style="{ width: progress + '%' }"
            ></div>
          </div>

          <!-- Loading spinner -->
          <div v-else class="spinner-border text-primary pe-auto" role="status">
            <span class="visually-hidden">{{ $t("loading") }}</span>
          </div>

          <!-- Abort button shown after a while -->
          <TransitionFade>
            <button
              v-if="abort && showAbort"
              type="button"
              class="btn btn-danger pe-auto"
              @click="abort()"
            >
              {{ $t("result.abort") }}
            </button>
          </TransitionFade>
        </div>
      </div>
    </TransitionFade>
  </div>
</template>
