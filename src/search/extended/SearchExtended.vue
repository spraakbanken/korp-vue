<script lang="ts" setup>
import { reactive, ref } from "vue"
import SearchExtendedAttribute from "./SearchExtendedAttribute.vue"
import SearchExtendedOperator from "./SearchExtendedOperator.vue"
import SearchExtendedValue from "./SearchExtendedValue.vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, parse, stringify } from "@/core/cqp/cqp"
import { isCqpToken, type CqpQuery, type CqpToken } from "@/core/cqp/cqp.types"
import GlobalFilters from "../GlobalFilters.vue"
import { until, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { splitFirst } from "@/core/util"
import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"

const store = useAppStore()

const createToken = (): CqpToken => ({
  and_block: [[createCondition("")]],
})

const tokens = reactive<CqpQuery>([createToken()])
const { search } = storeToRefs(store)
const isFilterReady = ref(false)
const globalFilterManager = GlobalFilterManager.getInstance()

// Flag when the filter manager is ready, so that the initial search can include the filter selection.
globalFilterManager.listen(() => (isFilterReady.value = true))

watchImmediate(search, () => {
  // For extended, `search` is just `"cqp"` and the actual CQP is in `cqp`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "cqp" || value) return

  // Replace query under construction
  tokens.splice(0, tokens.length, ...parse<CqpQuery>(store.cqp))

  // Trigger search
  commitSearch()
})

function addToken() {
  tokens.push(createToken())
}

function removeToken(index: number) {
  if (index !== -1) tokens.splice(index, 1)
}

function addDisjunction(tokenIndex: number) {
  if (!isCqpToken(tokens[tokenIndex])) throw new Error("Cannot modify non-existing or struct token")
  tokens[tokenIndex].and_block.push([createCondition()])
}

function addCondition(tokenIndex: number, disjunctionIndex: number) {
  if (!isCqpToken(tokens[tokenIndex])) throw new Error("Cannot modify non-existing or struct token")
  tokens[tokenIndex]!.and_block[disjunctionIndex]!.push(createCondition())
}

function removeCondition(tokenIndex: number, disjunctionIndex: number, conditionIndex: number) {
  if (!isCqpToken(tokens[tokenIndex])) throw new Error("Cannot modify non-existing or struct token")
  tokens[tokenIndex]!.and_block[disjunctionIndex]!.splice(conditionIndex, 1)

  // If the disjunction is empty, remove it
  if (tokens[tokenIndex]!.and_block[disjunctionIndex]!.length == 0) {
    tokens[tokenIndex]!.and_block.splice(disjunctionIndex, 1)
  }
}

/** Handle clicking the Search button */
function submit() {
  store.extendedCqp = stringify(globalFilterManager.mergeToCqp(tokens), true)
  store.cqp = stringify(tokens)
  store.search = "cqp"
  commitSearch()
}

/** Declare query as the active search */
async function commitSearch() {
  // Let filter manager finish settling, so that the filter selection can be included in the initial search query.
  await until(isFilterReady).toBe(true, { timeout: 1000 })

  const cqp = stringify(globalFilterManager.mergeToCqp(tokens))
  store.activeSearch = { cqp }
}
</script>

<template>
  <form @submit.prevent="submit" class="d-flex flex-column gap-4 align-items-center">
    <GlobalFilters />

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
        <div v-if="isCqpToken(token)" class="card-body d-flex flex-column gap-2">
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

        <div v-else>TODO struct token</div>
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
