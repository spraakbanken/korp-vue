<template>
  <div class="bg-secondary-subtle p-2 d-flex gap-4 align-items-baseline">
    <!-- Primary content -->
    <slot />

    <!-- Secondary content -->
    <div v-if="$slots.end" class="flex-grow-1"></div>
    <slot name="end" />
  </div>
</template>
