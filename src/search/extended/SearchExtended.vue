<script lang="ts" setup>
import { computed, ref, watch, watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, parse, stringify, supportsInOrder } from "@/core/cqp/cqp"
import { type CqpQuery } from "@/core/cqp/cqp.types"
import GlobalFilters from "../GlobalFilters.vue"
import { until, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { splitFirst } from "@/core/util"
import QueryBuilder from "./QueryBuilder.vue"
import { useReactiveFilterManager } from "../useReactiveFilterManager"
import SaveSearchButton from "../SaveSearchButton.vue"
import HelpBadge from "@/components/HelpBadge.vue"

const store = useAppStore()
const filterManager = useReactiveFilterManager()

const tokens = ref<CqpQuery>([{ and_block: [[createCondition("")]] }])
const cqp = computed(() => stringify(filterManager.mergeToCqp(tokens.value)))
const cqpExpanded = computed(() => stringify(filterManager.mergeToCqp(tokens.value), true))
const { in_order, search } = storeToRefs(store)
const isFilterReady = ref(false)
const freeOrder = ref(!in_order.value)

// Flag when the filter manager is ready, so that the initial search can include the filter selection.
watch(filterManager, () => (isFilterReady.value = true))

watchImmediate(search, () => {
  // For extended, `search` is just `"cqp"` and the actual CQP is in `cqp`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "cqp" || value) return

  // Replace query under construction
  tokens.value = parse<CqpQuery>(store.cqp)

  // Trigger search
  commitSearch()
})

/** Handle clicking the Search button */
function submit() {
  store.in_order = !freeOrder.value || !supportsInOrder(tokens.value)
  store.cqp = stringify(tokens.value)
  store.search = "cqp"
  store.page = 0
  commitSearch()
}

/** Declare query as the active search */
async function commitSearch() {
  // Let filter manager finish settling, so that the filter selection can be included in the initial search query.
  await until(isFilterReady).toBe(true, { timeout: 1000 })

  store.activeSearch = { cqp: cqp.value }
}

watchEffect(() => (freeOrder.value = !in_order.value))
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
