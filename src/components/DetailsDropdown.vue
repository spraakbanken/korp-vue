<script lang="ts" setup>
import { Dropdown } from "bootstrap"
import { useId, useTemplateRef } from "vue"
import { vElementHover } from "@vueuse/components"

const id = useId()
const toggle = useTemplateRef<HTMLButtonElement>("toggle")

function onHover(state: boolean) {
  const dropdown = Dropdown.getOrCreateInstance(toggle.value!)
  if (state) dropdown.show()
  else dropdown.hide()
}
</script>

<template>
  <div class="dropdown float-end" v-element-hover="[onHover, { delayEnter: 300, delayLeave: 300 }]">
    <button
      type="button"
      :id
      ref="toggle"
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
