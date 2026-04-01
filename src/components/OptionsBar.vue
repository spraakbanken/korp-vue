<template>
  <div
    class="align-self-stretch bg-body-secondary p-2 d-flex flex-wrap gap-1 col-gap-4 align-items-baseline rounded"
  >
    <!-- Primary content -->
    <slot />

    <!-- Secondary content -->
    <div v-if="$slots.end" class="flex-grow-1"></div>
    <slot name="end" />
  </div>
</template>
