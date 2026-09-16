<script setup lang="ts">
import TransitionFade from "@/components/TransitionFade.vue"

defineProps<{
  progress?: number
}>()
</script>

<template>
  <TransitionFade>
    <span
      v-if="progress != null && progress < 100"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      class="progress position-absolute bottom-0 start-0 w-100"
      style="height: 0.3rem"
    >
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </span>
  </TransitionFade>
</template>

<style scoped>
/* Animation for progressbar background */
.progress {
  background: linear-gradient(90deg, transparent, var(--bs-primary) 30%, transparent 60%);
  background-size: 1rem;
  animation: bg-pan 1s linear infinite;
}

@keyframes bg-pan {
  100% {
    background-position-x: 1rem;
  }
}
</style>
