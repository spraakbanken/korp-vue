<script setup lang="ts">
import type { Condition } from "@/core/cqp/cqp.types"
import QueryBuilderAttribute from "./QueryBuilderAttribute.vue"
import QueryBuilderOperator from "./QueryBuilderOperator.vue"
import QueryBuilderValue from "./QueryBuilderValue.vue"

const condition = defineModel<Condition>({ required: true })
</script>

<template>
  <div class="flex-grow-1 vstack gap-1">
    <QueryBuilderAttribute v-model="condition.type" />
    <div class="hstack gap-1">
      <QueryBuilderOperator :condition v-model="condition.op" />
      <QueryBuilderValue
        :condition
        @update="(value) => (condition.val = value)"
        class="flex-grow-1"
      />
    </div>
  </div>
</template>
