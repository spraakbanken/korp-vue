<script lang="ts" setup>
import type { Condition } from "@/core/cqp/cqp.types"
import { useId } from "vue"

defineProps<{
  condition: Condition
}>()

const emit = defineEmits<{
  (e: "update", value: string): void
}>()

const inputId = useId()

function update(event: Event) {
  const target = event.target as HTMLInputElement
  emit("update", target.value)
}
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.value") }}</label>
    <input :id="inputId" type="text" :value="condition.val" @change="update" class="form-control" />
  </div>
</template>
