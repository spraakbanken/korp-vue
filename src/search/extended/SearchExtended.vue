<script lang="ts" setup>
import { reactive } from "vue"
import type { SearchToken } from "./searchExtended.types"
import SearchExtendedAttribute from "./SearchExtendedAttribute.vue"
import SearchExtendedOperator from "./SearchExtendedOperator.vue"
import SearchExtendedValue from "./SearchExtendedValue.vue"
import { randomString } from "@/core/util"
import { useAppStore } from "@/store/useAppStore"
import { stringify } from "@/core/cqp/cqp"

type WithId<T extends object> = T & { id: string }

const store = useAppStore()

const createEmptyToken = (): WithId<SearchToken> => ({
  id: randomString(),
  attr: { name: "word", label: "Word" },
  operator: "=",
  value: "",
})

const tokens = reactive<WithId<SearchToken>[]>([createEmptyToken()])

function addToken() {
  tokens.push(createEmptyToken())
}

function removeToken(id: string) {
  const index = tokens.findIndex((token) => token.id === id)
  if (index !== -1) tokens.splice(index, 1)
}

function submit() {
  store.extendedCqp = createCqp()
  search()
}

function search() {
  store.activeSearch = {
    type: undefined,
    cqp: createCqp(),
  }
}

function createCqp(): string {
  return stringify(
    tokens.map((token) => ({
      and_block: [
        [
          {
            type: token.attr.name,
            op: token.operator,
            val: token.value,
          },
        ],
      ],
    })),
  )
}
</script>

<template>
  <form @submit.prevent="submit" class="d-flex flex-column gap-4 align-items-center">
    <div class="d-flex gap-4 align-items-center">
      <div v-for="token in tokens" :key="token.id" class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          Token
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="removeToken(token.id)"
          ></button>
        </div>

        <div class="card-body">
          <SearchExtendedAttribute :token />
          <SearchExtendedOperator :token />
          <SearchExtendedValue :token />
        </div>
      </div>

      <div>
        <button class="btn btn-secondary" @click="addToken">+ Add token</button>
      </div>
    </div>

    <input type="submit" :value="$t('search')" class="btn btn-primary" />
  </form>
</template>
