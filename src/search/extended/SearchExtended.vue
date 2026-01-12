<script lang="ts" setup>
import { reactive, ref } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { createCondition, parse, stringify } from "@/core/cqp/cqp"
import { type CqpQuery } from "@/core/cqp/cqp.types"
import GlobalFilters from "../GlobalFilters.vue"
import { until, watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { splitFirst } from "@/core/util"
import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"
import QueryBuilder from "./QueryBuilder.vue"

const store = useAppStore()

const tokens = reactive<CqpQuery>([{ and_block: [[createCondition("")]] }])
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

    <QueryBuilder v-model="tokens" />

    <div class="small text-muted">
      {{ $t("search.extended.instructions") }}
    </div>

    <input type="submit" :value="$t('search')" class="btn btn-primary" />
  </form>
</template>
