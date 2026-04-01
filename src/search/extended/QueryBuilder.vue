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
import QueryToken from "./QueryToken.vue"
import QueryStruct from "./QueryStruct.vue"

const tokens = defineModel<CqpQuery>({ required: true })

const [isAddingBoundary, toggleAddingBoundary] = useToggle(false)

const createToken = (): CqpToken => ({ and_block: [[createCondition("")]] })

function addToken() {
  tokens.value.push(createToken())
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
  <div class="d-flex gap-4 align-items-center overflow-x-auto overflow-y-hidden">
    <!-- TODO Dropdowns in *AutocompleteWidget are clipped -->
    <div v-for="(token, i) in tokens" :key="i" class="card flex-shrink-0 p-2">
      <QueryToken
        v-if="isCqpToken(token)"
        v-model="token.and_block"
        :can-remove="hasMultipleTokenConditions(tokens)"
        @remove="removeItem(i)"
      />

      <QueryStruct
        v-else-if="isCqpStruct(token)"
        v-model:struct="token.struct"
        v-model:start="token.start"
        @remove="removeItem(i)"
      />

      <div v-else>TODO Bound? {{ token }}</div>
    </div>

    <div class="d-flex flex-column gap-2">
      <button type="button" class="btn btn-secondary text-nowrap" @click="addToken()">
        <fa-icon icon="fa-solid fa-plus" />
        {{ $t("search.extended.token_add") }}
      </button>

      <button
        v-if="!isAddingBoundary"
        type="button"
        class="btn btn-secondary text-nowrap"
        @click="toggleAddingBoundary(true)"
      >
        <fa-icon icon="fa-solid fa-plus" />
        {{ $t("search.extended.boundary_add") }}
      </button>

      <div
        v-on-click-outside="() => toggleAddingBoundary(false)"
        v-else
        class="btn-group"
        role="group"
        :aria-label="$t('search.extended.boundary_add')"
      >
        <button type="button" class="btn btn-primary" @click="addBoundary(true)">
          <fa-icon icon="fa-solid fa-arrow-left" />
          {{ $t("search.extended.boundary_add.start") }}
        </button>
        <button type="button" class="btn btn-primary" @click="addBoundary(false)">
          <fa-icon icon="fa-solid fa-arrow-right" />
          {{ $t("search.extended.boundary_add.end") }}
        </button>
      </div>
    </div>
  </div>
</template>
