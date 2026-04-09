<script lang="ts" setup>
import { useId } from "vue"

const id = useId()
</script>

<template>
  <div class="dropdown float-end">
    <button
      type="button"
      :id
      class="btn btn-link p-0 small lh-1 text-secondary"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-haspopup="true"
      :aria-label="$t('details')"
      aria-expanded="false"
    >
      <fa-icon icon="fa-solid fa-ellipsis-vertical" />
    </button>
    <div class="dropdown-menu card p-2" :aria-labelledby="id">
      <slot />
    </div>
  </div>
</template>
