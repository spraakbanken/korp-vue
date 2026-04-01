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

const [isAddingBoundary, toggleAddingBoundary] = useToggle(false)

const tokens = defineModel<CqpQuery>({ required: true })

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
