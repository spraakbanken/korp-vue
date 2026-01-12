<script lang="ts" setup>
import SearchExtendedAttribute from "./SearchExtendedAttribute.vue"
import SearchExtendedOperator from "./SearchExtendedOperator.vue"
import SearchExtendedValue from "./SearchExtendedValue.vue"
import { createCondition } from "@/core/cqp/cqp"
import { isCqpToken, type CqpQuery, type CqpToken } from "@/core/cqp/cqp.types"

const tokens = defineModel<CqpQuery>({ required: true })

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
    tokens.value.splice(tokenIndex, 1)
  }
}
</script>

<template>
  <div class="d-flex gap-4 align-items-center overflow-x-auto">
    <div v-for="(token, i) in tokens" :key="i" class="card flex-shrink-0">
      <!-- 2-dimensional repetition: an AND of OR's-->
      <div v-if="isCqpToken(token)" class="card-body p-2 d-flex flex-column gap-2">
        <template v-for="(disjunction, j) in token.and_block" :key="j">
          <div v-if="j > 0">{{ $t("search.and") }}</div>

          <div class="card bg-body-tertiary">
            <div class="card-body p-2 d-flex flex-column gap-2">
              <template v-for="(condition, k) in disjunction" :key="k">
                <div v-if="k > 0">{{ $t("search.or") }}</div>

                <!-- Each condition (attribute-operator-value) -->
                <div class="d-flex gap-3 align-items-center">
                  <div class="flex-grow-1 d-flex flex-column gap-2">
                    <SearchExtendedAttribute
                      :condition
                      @update="(name) => (condition.type = name)"
                    />
                    <div class="d-flex gap-2 align-items-baseline">
                      <SearchExtendedOperator :condition @update="(op) => (condition.op = op)" />
                      <SearchExtendedValue
                        :condition
                        @update="(value) => (condition.val = value)"
                        class="flex-grow-1"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn-close"
                    :aria-label="$t('search.extended.condition_remove')"
                    @click="removeCondition(i, j, k)"
                    :class="{
                      invisible:
                        tokens.length == 1 &&
                        token.and_block.length == 1 &&
                        disjunction.length == 1,
                    }"
                    style="width: 0.2rem; background-size: contain"
                  ></button>
                </div>
              </template>

              <div>
                <button type="button" class="btn btn-text btn-sm" @click="addCondition(i, j)">
                  + {{ $t("search.or") }}…
                </button>
              </div>
            </div>
          </div>
        </template>

        <div>
          <button type="button" class="btn btn-text btn-sm" @click="addDisjunction(i)">
            + {{ $t("search.and") }}…
          </button>
        </div>
      </div>

      <div v-else>TODO struct token</div>
    </div>

    <div>
      <button type="button" class="btn btn-secondary text-nowrap" @click="addToken()">
        + {{ $t("search.extended.token_add") }}
      </button>
    </div>
  </div>
</template>
