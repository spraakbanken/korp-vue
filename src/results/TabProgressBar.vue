<script setup lang="ts">
defineProps<{
  progress?: number
}>()
</script>

<template>
  <Transition>
    <div
      v-show="progress != null && progress < 100"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      style="display: inline"
    >
      <!-- TODO Spinner -->
      <span>(%)</span>

      <!-- Bar -->
      <div
        class="progress progress-bar-striped progress-bar-animated bg-transparent position-absolute bottom-0 start-0 w-100"
        style="height: 0.2rem"
      >
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
