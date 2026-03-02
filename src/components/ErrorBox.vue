<script lang="ts" setup>
export type ErrorMessage = {
  message: string
  details?: string
  code?: string
}

defineProps<ErrorMessage>()
</script>

<template>
  <div class="alert alert-danger bg-white border-2 d-flex align-items-center gap-4">
    <img src="@/assets/korp_fail.svg" role="presentation" class="d-block" style="height: 8rem" />

    <div>
      <h4 class="alert-heading">{{ message }}</h4>
      <p v-if="details">{{ details }}</p>
      <pre v-if="code" class="text-wrap">{{ code }}</pre>
      <p class="mb-0">{{ $t("error.footer") }}</p>
    </div>
  </div>
</template>
