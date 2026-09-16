<template>
  <Transition appear>
    <slot />
  </Transition>
</template>

<style scoped>
/* Classes used by `Transition` */
.v-enter-active,
.v-leave-active {
  transition: opacity 300ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
