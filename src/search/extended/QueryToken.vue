<script lang="ts" setup>
/** A token item in the query builder, with one or more conditions */
import { createCondition } from "@/core/cqp/cqp"
import { type Condition } from "@/core/cqp/cqp.types"
import QueryBuilderCondition from "./QueryBuilderCondition.vue"
import QueryTokenRepeat from "./QueryTokenRepeat.vue"

const conditions = defineModel<Condition[][]>({ required: true })
const repeat = defineModel<[number, number] | undefined>("repeat")

defineProps<{
  /** Whether conditions can be removed */
  canRemove?: boolean
}>()

const emit = defineEmits<{
  /** Remove this token */
  (event: "remove"): void
}>()

function removeCondition(disjunctionIndex: number, conditionIndex: number) {
  conditions.value[disjunctionIndex]!.splice(conditionIndex, 1)

  // If the disjunction is empty, remove it
  if (conditions.value[disjunctionIndex]!.length == 0) {
    conditions.value.splice(disjunctionIndex, 1)
  }

  // If the token is empty, remove it
  if (conditions.value.length == 0) {
    emit("remove")
  }
}
</script>

<template>
  <div class="vstack gap-2">
    <!-- 2-dimensional repetition: an AND of OR's-->
    <template v-for="(disjunction, j) in conditions" :key="j">
      <div v-if="j > 0">{{ $t("search.and") }}</div>

      <div class="card bg-body-tertiary p-2 vstack gap-2">
        <template v-for="(condition, k) in disjunction" :key="k">
          <div v-if="k > 0">{{ $t("search.or") }}</div>

          <!-- Each condition (attribute-operator-value) -->
          <div class="hstack gap-2">
            <QueryBuilderCondition
              v-model:attribute="condition.type"
              v-model:operator="condition.op"
              v-model:value="condition.val"
              v-model:flags="condition.flags"
            />

            <button
              type="button"
              class="btn-close"
              :aria-label="$t('search.extended.condition_remove')"
              @click="removeCondition(j, k)"
              :class="{ invisible: !canRemove }"
              style="width: 0.2rem; background-size: contain"
            ></button>
          </div>
        </template>

        <div>
          <!-- Button for adding to OR -->
          <button
            type="button"
            class="btn btn-link text-decoration-none btn-sm"
            @click="disjunction.push(createCondition())"
          >
            <fa-icon icon="fa-solid fa-plus" />
            {{ $t("search.or") }}…
          </button>
        </div>
      </div>
    </template>

    <!-- Bottom row -->
    <div class="hstack gap-2 pe-2">
      <!-- Button for adding to AND -->
      <button
        type="button"
        class="btn btn-link text-decoration-none btn-sm me-auto"
        @click="conditions.push([createCondition()])"
      >
        <fa-icon icon="fa-solid fa-plus" />
        {{ $t("search.and") }}…
      </button>

      <!-- Repetition -->
      <QueryTokenRepeat v-model="repeat" />
    </div>
  </div>
</template>
