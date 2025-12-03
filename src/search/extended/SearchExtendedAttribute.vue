<script lang="ts" setup>
import type { Condition } from "@/core/cqp/cqp.types"

defineProps<{
  condition: Condition
}>()
</script>

<template>
  <div>
    <select>
      <option>word</option>
    </select>
  </div>
</template>
