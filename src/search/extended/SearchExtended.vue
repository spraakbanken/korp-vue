<script lang="ts" setup>
import { reactive } from "vue"
import SearchExtendedAttribute from "./SearchExtendedAttribute.vue"
import SearchExtendedOperator from "./SearchExtendedOperator.vue"
import SearchExtendedValue from "./SearchExtendedValue.vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, stringify } from "@/core/cqp/cqp"
import type { CqpToken } from "@/core/cqp/cqp.types"

const store = useAppStore()

const createToken = (): CqpToken => ({
  and_block: [[createCondition("bra")]],
})

const tokens = reactive<CqpToken[]>([createToken()])

function addToken() {
  tokens.push(createToken())
}

function removeToken(index: number) {
  if (index !== -1) tokens.splice(index, 1)
}

function addDisjunction(tokenIndex: number) {
  tokens[tokenIndex]!.and_block.push([createCondition()])
}

function addCondition(tokenIndex: number, disjunctionIndex: number) {
  tokens[tokenIndex]!.and_block[disjunctionIndex]!.push(createCondition())
}

function removeCondition(tokenIndex: number, disjunctionIndex: number, conditionIndex: number) {
  tokens[tokenIndex]!.and_block[disjunctionIndex]!.splice(conditionIndex, 1)

  // If the disjunction is empty, remove it
  if (tokens[tokenIndex]!.and_block[disjunctionIndex]!.length == 0) {
    tokens[tokenIndex]!.and_block.splice(disjunctionIndex, 1)
  }
}

function submit() {
  store.extendedCqp = createCqp()
  store.cqp = createCqp()
  store.search = "cqp"
  search()
}

function search() {
  store.activeSearch = {
    type: undefined,
    cqp: createCqp(),
  }
}

function createCqp(): string {
  return stringify(tokens)
}
</script>

<template>
  <form @submit.prevent="submit" class="d-flex flex-column gap-4 align-items-center">
    <div class="d-flex gap-4 align-items-center overflow-x-auto">
      <div v-for="(token, i) in tokens" :key="i" class="card flex-shrink-0">
        <div class="card-header d-flex justify-content-between align-items-center">
          {{ $t("search.extended.token") }}
          <button
            type="button"
            class="btn-close"
            :aria-label="$t('search.extended.token_remove')"
            @click="removeToken(i)"
          ></button>
        </div>

        <!-- 2-dimensional repetition: an AND of OR's-->
        <div class="card-body d-flex flex-column gap-2">
          <template v-for="(disjunction, j) in token.and_block" :key="j">
            <div v-if="j > 0">{{ $t("search.and") }}</div>

            <div class="card bg-body-tertiary">
              <div class="card-body d-flex flex-column gap-2">
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
                        invisible: token.and_block.length == 1 && disjunction.length == 1,
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
      </div>

      <div>
        <button type="button" class="btn btn-secondary" @click="addToken()">
          + {{ $t("search.extended.token_add") }}
        </button>
      </div>
    </div>

    <input type="submit" :value="$t('search')" class="btn btn-primary" />
  </form>
</template>
