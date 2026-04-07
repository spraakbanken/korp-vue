<template>
  <div class="align-self-stretch p-2 hstack flex-wrap gap-1 column-gap-2 bg-body-secondary rounded">
    <!-- Primary content -->
    <slot />

    <!-- Secondary content -->
    <div v-if="$slots.end" class="flex-grow-1"></div>
    <slot name="end" />
  </div>
</template>
