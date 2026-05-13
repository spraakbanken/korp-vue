<script lang="ts" setup generic="T">
/** @file A limited list with a collapse/expand button */
import { useToggle } from "@vueuse/core"
import { computed } from "vue"

const { items, limit = 3 } = defineProps<{
  items: T[]
  limit?: number
}>()

const [full, toggle] = useToggle()

/** Whether the list is long enough to enable collapse/expand */
// Allow an extra item, as it will take roughly the same space as the expand/collapse button anyway
const long = computed(() => items.length > limit + 1)

/** The list of items to show, limited or not */
const list = computed(() => (full.value || !long.value ? items : items.slice(0, limit)))
</script>

<template>
  <ul>
    <li v-for="(item, i) in list" :key="`${i} ${String(item)}`">
      <slot v-bind="{ item }" />
    </li>

    <li v-if="long">
      <button class="btn btn-link text-secondary icon-link p-0" @click="toggle()">
        <fa-icon
          :icon="`fa-solid ${full ? 'fa-angles-up' : 'fa-angles-down'}`"
          size="sm"
          width-auto
        />
        {{ $t(full ? "show_less" : "show_more") }}
      </button>
    </li>
  </ul>
</template>
