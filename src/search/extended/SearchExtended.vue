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
    <div class="d-flex gap-4 align-items-center">
      <div v-for="(token, i) in tokens" :key="i" class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          Token
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="removeToken(i)"
          ></button>
        </div>

        <!-- 2-dimentional repetition: an AND of OR's-->
        <div class="card-body d-flex flex-column gap-2">
          <template v-for="(disjunction, j) in token.and_block" :key="j">
            <div v-if="j > 0">and</div>

            <div class="card bg-body-tertiary">
              <div class="card-body d-flex flex-column gap-2">
                <template v-for="(condition, k) in disjunction" :key="k">
                  <div v-if="k > 0">or</div>

                  <!-- Each condition (attribute-operator-value) -->
                  <div class="d-flex gap-2 align-items-center">
                    <div class="d-flex flex-column gap-2">
                      <div class="d-flex gap-2 align-items-baseline">
                        <SearchExtendedAttribute :condition />
                        <SearchExtendedOperator :condition />
                      </div>
                      <SearchExtendedValue :condition />
                    </div>

                    <button
                      class="btn-close"
                      aria-label="Remove condition"
                      @click="removeCondition(i, j, k)"
                      :class="{
                        invisible: token.and_block.length == 1 && disjunction.length == 1,
                      }"
                      style="transform: scale(0.6)"
                    ></button>
                  </div>
                </template>

                <div>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    @click="addCondition(i, j)"
                  >
                    + or…
                  </button>
                </div>
              </div>
            </div>
          </template>

          <div>
            <button type="button" class="btn btn-secondary btn-sm" @click="addDisjunction(i)">
              + and…
            </button>
          </div>
        </div>
      </div>

      <div>
        <button type="button" class="btn btn-secondary" @click="addToken()">+ Add token</button>
      </div>
    </div>

    <input type="submit" :value="$t('search')" class="btn btn-primary" />
  </form>
</template>
