<script lang="ts" setup>
/** Content for the Extended search tab with a query builder GUI */
import { ref, watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, parse, stringify, supportsInOrder } from "@/core/cqp/cqp"
import { type CqpQuery } from "@/core/cqp/cqp.types"
import GlobalFilters from "../GlobalFilters.vue"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { splitFirst } from "@/core/util"
import QueryBuilder from "./QueryBuilder.vue"
import SaveSearchButton from "../SaveSearchButton.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import useSearchStore from "../useSearchStore"
import useMessageStore from "@/store/useMessageStore"

const store = useAppStore()
const { search } = storeToRefs(store)
const searchStore = useSearchStore()
const { addMessage } = useMessageStore()

/** Query structure being edited */
const tokens = ref<CqpQuery>([{ and_block: [[createCondition("")]] }])

/** Model for the free order option */
const freeOrder = ref(!store.in_order)

// React to the `search` param being changed, at first load or later
watchImmediate(search, () => {
  // For extended, `search` is just `"cqp"` and the actual CQP is in `cqp`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "cqp" || value) return

  // Replace query under construction
  try {
    tokens.value = parse<CqpQuery>(store.cqp)
  } catch (e) {
    addMessage("error", e instanceof Error ? e.message : String(e))
  }

  // Trigger search
  searchStore.commitQuery(tokens.value)
})

/** Handle clicking the Search button */
function submit() {
  store.in_order = !freeOrder.value || !supportsInOrder(tokens.value)
  store.cqp = stringify(tokens.value)
  store.search = "cqp"
  store.page = 0
  searchStore.commitQuery(tokens.value)
}

// Sync from store to local state
watchEffect(() => (freeOrder.value = !store.in_order))
// Sync from local state to store
watchEffect(() => (searchStore.queryExtended = tokens.value))
</script>

<template>
  <form @submit.prevent="submit" class="vstack gap-4">
    <!-- Global filters bar -->
    <GlobalFilters />

    <!-- Side-scrolling query builder -->
    <QueryBuilder v-model="tokens" />

    <!-- Instructions -->
    <div class="small text-muted text-center">
      {{ $t("search.extended.instructions") }}
    </div>

    <div class="hstack justify-content-center gap-2">
      <!-- "Free order" option -->
      <div class="form-check">
        <input
          type="checkbox"
          id="search-extended-free-order"
          v-model="freeOrder"
          class="form-check-input"
        />
        <label for="search-extended-free-order" class="form-check-label">
          {{ $t("search.free_order") }}
          <HelpBadge :text="$t('search.free_order.help')" />
        </label>
      </div>

      <!-- Search/save buttons -->
      <div class="btn-group">
        <input type="submit" :value="$t('search')" class="btn btn-primary" />
        <SaveSearchButton :query="tokens" />
      </div>
    </div>

    <div class="text-danger text-center" v-if="freeOrder && !supportsInOrder(tokens)">
      <i18n-t scope="global" keypath="search.extended.free_order_invalid">
        <template #free_order>
          <em>{{ $t("search.free_order") }}</em>
        </template>
      </i18n-t>
    </div>
  </form>
</template>
