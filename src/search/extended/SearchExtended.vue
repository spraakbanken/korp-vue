<script lang="ts" setup>
/** Content for the Extended search tab with a query builder GUI */
import { computed, ref, watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, parse, stringify, supportsInOrder } from "@/core/cqp/cqp"
import { type CqpQuery } from "@/core/cqp/cqp.types"
import GlobalFilters from "../GlobalFilters.vue"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { splitFirst } from "@/core/util"
import QueryBuilder from "./QueryBuilder.vue"
import { useReactiveFilterManager } from "../useReactiveFilterManager"
import SaveSearchButton from "../SaveSearchButton.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import useSearchStore from "../useSearchStore"

const store = useAppStore()
const { search } = storeToRefs(store)
/** Reactive global filter manager singleton */
const filterManager = useReactiveFilterManager()
const { commitQuery } = useSearchStore()

/** Query structure being edited */
const tokens = ref<CqpQuery>([{ and_block: [[createCondition("")]] }])

/** Computed standard CQP string of query including global filters */
const cqpExpanded = computed(() => stringify(filterManager.mergeToCqp(tokens.value), true))
/** Model for the free order option */
const freeOrder = ref(!store.in_order)

// React to the `search` param being changed, at first load or later
watchImmediate(search, () => {
  // For extended, `search` is just `"cqp"` and the actual CQP is in `cqp`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "cqp" || value) return

  // Replace query under construction
  tokens.value = parse<CqpQuery>(store.cqp)

  // Trigger search
  commitQuery(tokens.value)
})

/** Handle clicking the Search button */
function submit() {
  store.in_order = !freeOrder.value || !supportsInOrder(tokens.value)
  store.cqp = stringify(tokens.value)
  store.search = "cqp"
  store.page = 0
  commitQuery(tokens.value)
}

// Sync from store to local state
watchEffect(() => (freeOrder.value = !store.in_order))
// Sync from local state to store
watchEffect(() => (store.extendedCqp = cqpExpanded.value))
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
        <SaveSearchButton :cqp="cqpExpanded" :suggested-label="cqpExpanded" />
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
