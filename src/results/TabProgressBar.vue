<script setup lang="ts">
defineProps<{
  progress?: number
}>()
</script>

<template>
  <!-- `Transition` adds opacity animation when `v-show` changes -->
  <Transition>
    <span
      v-show="progress != null && progress < 100"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      class="progress position-absolute bottom-0 start-0 w-100"
      style="height: 0.2rem"
    >
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </span>
  </Transition>
</template>

<style scoped>
/* Classes used by `Transition` */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Animation for progressbar background */
.progress {
  background: linear-gradient(90deg, transparent, var(--bs-primary-bg-subtle) 30%, transparent 60%);
  background-size: 1rem;
  animation: bg-pan 1s linear infinite;
}

@keyframes bg-pan {
  100% {
    background-position-x: 1rem;
  }
}
</style>
