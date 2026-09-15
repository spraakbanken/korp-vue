<script lang="ts" setup>
import ErrorBox, { type ErrorMessage } from "@/components/ErrorBox.vue"
import { computed, toValue, type MaybeRefOrGetter } from "vue"
import type { ResultState } from "./useResultState"

const props = defineProps<{
  errorMessage: ErrorMessage | undefined
  state: ResultState
  populated: MaybeRefOrGetter<boolean>
}>()

const populated = computed(() => toValue(props.populated))
</script>

<template>
  <div>
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
  </div>
</template>
