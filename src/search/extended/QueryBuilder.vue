<script lang="ts" setup>
import { useToggle } from "@vueuse/core"
import { vOnClickOutside } from "@vueuse/components"
import { createCondition, hasMultipleTokenConditions } from "@/core/cqp/cqp"
import {
  isCqpStruct,
  isCqpToken,
  type CqpQuery,
  type CqpStruct,
  type CqpToken,
} from "@/core/cqp/cqp.types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { computed } from "vue"
import QueryBuilderCondition from "./QueryBuilderCondition.vue"

const [isAddingBoundary, toggleAddingBoundary] = useToggle(false)

const tokens = defineModel<CqpQuery>({ required: true })

const canRemoveCondition = computed(() => hasMultipleTokenConditions(tokens.value))

const createToken = (): CqpToken => ({ and_block: [[createCondition("")]] })

function addToken() {
  tokens.value.push(createToken())
}

function addDisjunction(tokenIndex: number) {
  if (!isCqpToken(tokens.value[tokenIndex]))
    throw new Error("Cannot modify non-existing or struct token")
  tokens.value[tokenIndex].and_block.push([createCondition()])
}

function addCondition(tokenIndex: number, disjunctionIndex: number) {
  if (!isCqpToken(tokens.value[tokenIndex]))
    throw new Error("Cannot modify non-existing or struct token")
  tokens.value[tokenIndex].and_block[disjunctionIndex]!.push(createCondition())
}

function removeCondition(tokenIndex: number, disjunctionIndex: number, conditionIndex: number) {
  if (!isCqpToken(tokens.value[tokenIndex]))
    throw new Error("Cannot modify non-existing or struct token")
  tokens.value[tokenIndex].and_block[disjunctionIndex]!.splice(conditionIndex, 1)

  // If the disjunction is empty, remove it
  if (tokens.value[tokenIndex].and_block[disjunctionIndex]!.length == 0) {
    tokens.value[tokenIndex].and_block.splice(disjunctionIndex, 1)
  }

  // If the token is empty, remove it
  if (tokens.value[tokenIndex].and_block.length == 0) {
    removeItem(tokenIndex)
  }
}

function removeItem(index: number) {
  tokens.value.splice(index, 1)
}

/** Add a boundary token, e.g. sentence start */
function addBoundary(start: boolean) {
  // Create a boundary token
  // Select "sentence" or whichever other struct tag is first
  const tags = Object.keys(corpusSelection.getCommonWithins())
  const struct = tags.includes("sentence") ? "sentence" : tags[0]!
  const boundary: CqpStruct = { struct, start }

  // Add it first or last
  if (start) tokens.value.unshift(boundary)
  else tokens.value.push(boundary)

  // Reset the add button
  toggleAddingBoundary(false)
}
</script>

<template>
  <div class="d-flex gap-4 align-items-center overflow-x-auto">
    <div v-for="(token, i) in tokens" :key="i" class="card flex-shrink-0 p-2">
      <!-- 2-dimensional repetition: an AND of OR's-->
      <div v-if="isCqpToken(token)" class="vstack gap-2">
        <template v-for="(disjunction, j) in token.and_block" :key="j">
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
                  @click="removeCondition(i, j, k)"
                  :class="{ invisible: !canRemoveCondition }"
                  style="width: 0.2rem; background-size: contain"
                ></button>
              </div>
            </template>

            <div>
              <button
                type="button"
                class="btn btn-link text-decoration-none btn-sm"
                @click="addCondition(i, j)"
              >
                + {{ $t("search.or") }}…
              </button>
            </div>
          </div>
        </template>

        <div>
          <button
            type="button"
            class="btn btn-link text-decoration-none btn-sm"
            @click="addDisjunction(i)"
          >
            + {{ $t("search.and") }}…
          </button>
        </div>
      </div>

      <div v-else-if="isCqpStruct(token)" class="hstack gap-2">
        <div class="vstack gap-2">
          <select class="form-select">
            <option
              v-for="(label, tag) in corpusSelection.getCommonWithins()"
              :key="tag"
              :value="tag"
            >
              {{ $t(`tag.${label}`) }}
            </option>
          </select>

          <div>
            <div class="form-check">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="radio"
                  :name="`boundary-${i}-start`"
                  :checked="token.start"
                  @change="token.start = true"
                />
                {{ $t("search.extended.boundary.start") }}
              </label>
            </div>
            <div class="form-check">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="radio"
                  :name="`boundary-${i}-start`"
                  :checked="!token.start"
                  @change="token.start = false"
                />
                {{ $t("search.extended.boundary.end") }}
              </label>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn-close"
          :aria-label="$t('search.extended.boundary_remove')"
          @click="removeItem(i)"
          style="width: 0.2rem; background-size: contain"
        ></button>
      </div>

      <div v-else>TODO Bound? {{ token }}</div>
    </div>

    <div class="d-flex flex-column gap-2">
      <button type="button" class="btn btn-secondary text-nowrap" @click="addToken()">
        + {{ $t("search.extended.token_add") }}
      </button>

      <button
        v-if="!isAddingBoundary"
        type="button"
        class="btn btn-secondary text-nowrap"
        @click="toggleAddingBoundary(true)"
      >
        + {{ $t("search.extended.boundary_add") }}
      </button>

      <div
        v-on-click-outside="() => toggleAddingBoundary(false)"
        v-else
        class="btn-group"
        role="group"
        :aria-label="$t('search.extended.boundary_add')"
      >
        <button type="button" class="btn btn-primary" @click="addBoundary(true)">
          ←
          {{ $t("search.extended.boundary_add.start") }}
        </button>
        <button type="button" class="btn btn-primary" @click="addBoundary(false)">
          →
          {{ $t("search.extended.boundary_add.end") }}
        </button>
      </div>
    </div>
  </div>
</template>
