<script lang="ts" setup>
import { computed, reactive, ref, watch, watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, parse, stringify } from "@/core/cqp/cqp"
import { type CqpQuery } from "@/core/cqp/cqp.types"
import GlobalFilters from "../GlobalFilters.vue"
import { until, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { splitFirst } from "@/core/util"
import QueryBuilder from "./QueryBuilder.vue"
import { useReactiveFilterManager } from "../useReactiveFilterManager"
import SaveSearchButton from "../SaveSearchButton.vue"

const store = useAppStore()
const filterManager = useReactiveFilterManager()

const tokens = ref<CqpQuery>([{ and_block: [[createCondition("")]] }])
const cqp = computed(() => stringify(filterManager.mergeToCqp(tokens.value)))
const cqpExpanded = computed(() => stringify(filterManager.mergeToCqp(tokens.value), true))
const { search } = storeToRefs(store)
const isFilterReady = ref(false)

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

watchEffect(() => (store.extendedCqp = cqpExpanded.value))
</script>

<template>
  <form @submit.prevent="submit" class="d-flex flex-column gap-4 align-items-center">
    <GlobalFilters />

    <QueryBuilder v-model="tokens" />

    <div class="small text-muted">
      {{ $t("search.extended.instructions") }}
    </div>

    <div class="btn-group">
      <input type="submit" :value="$t('search')" class="btn btn-primary" />
      <SaveSearchButton :cqp="cqpExpanded" :suggested-label="cqpExpanded" />
    </div>
  </form>
</template>
