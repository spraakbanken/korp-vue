<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { splitFirst } from "@/core/util"
import { storeToRefs } from "pinia"
import { until, watchImmediate } from "@vueuse/core"
import { mergeCqpExprs, stringify } from "@/core/cqp/cqp"
import { buildSimpleLemgramCqp, buildSimpleWordCqp } from "@/core/search/simple"
import LemgramAutocomplete, { type LemgramAutocompleteModel } from "./LemgramAutocomplete.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import GlobalFilters from "./GlobalFilters.vue"
import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"

const store = useAppStore()
const { search, prefix, suffix, in_order, isCaseInsensitive } = storeToRefs(store)

const prefixLocal = ref(prefix.value)
const midfixLocal = ref(false)
const suffixLocal = ref(suffix.value)
const freeOrder = ref(!in_order.value)
const ignoreCase = ref(isCaseInsensitive.value)
const lemgram = ref<LemgramAutocompleteModel>({ type: "word", value: "" })
const isFilterReady = ref(false)

// Flag when the filter manager is ready, so that the initial search can include the filter selection.
GlobalFilterManager.getInstance().listen(() => (isFilterReady.value = true))

// Sync continually from store to form.
watchEffect(() => (prefixLocal.value = prefix.value))
watchEffect(() => (suffixLocal.value = suffix.value))
watchEffect(() => (midfixLocal.value = prefixLocal.value && suffixLocal.value))
watchEffect(() => (freeOrder.value = !in_order.value))
watchEffect(() => (ignoreCase.value = isCaseInsensitive.value))
watchImmediate(search, () => {
  // For simple, `search` has the format `{word,lemgram}|<value>`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "word" && type != "lemgram") return

  lemgram.value = { type, value }

  // Trigger search
  doSearch()
})

function onMidfixChange() {
  prefixLocal.value = midfixLocal.value
  suffixLocal.value = midfixLocal.value
}

function submit() {
  // Sync from form to store when submitting.
  store.prefix = prefixLocal.value
  store.suffix = suffixLocal.value
  store.in_order = !freeOrder.value
  store.isCaseInsensitive = ignoreCase.value

  const { type, value } = lemgram.value
  store.search = `${type}|${value}`
  doSearch()
}

async function doSearch() {
  const { type, value } = lemgram.value
  if (!value) return

  // Let filter manager finish settling, so that the filter selection can be included in the initial search query.
  await until(isFilterReady).toBe(true, { timeout: 1000 })

  store.activeSearch = { type, cqp: createCqp() }
}

function createCqp() {
  const { type, value } = lemgram.value
  const query =
    type == "lemgram"
      ? buildSimpleLemgramCqp(value, prefix.value, suffix.value)
      : buildSimpleWordCqp(value, prefix.value, suffix.value, ignoreCase.value)

  if (store.globalFilter) mergeCqpExprs(query, store.globalFilter)
  return stringify(query)
}
</script>

<template>
  <form @submit.prevent="submit" class="text-center">
    <GlobalFilters class="my-2" />

    <div class="d-flex gap-2 justify-content-center my-2">
      <LemgramAutocomplete v-model="lemgram" />
      <input type="submit" :value="$t('search')" class="btn btn-primary" />
    </div>

    <!-- Options 1 -->
    <div class="d-flex justify-content-center gap-4 my-2">
      <div class="form-check">
        <input
          id="search-simple-prefix"
          class="form-check-input"
          type="checkbox"
          v-model="prefixLocal"
        />
        <label class="form-check-label" for="search-simple-prefix">
          {{ $t("search.simple.prefix") }}
        </label>
        <HelpBadge :text="$t('search.simple.prefix.help')" />
      </div>

      <div class="form-check">
        <input
          id="search-simple-midfix"
          class="form-check-input"
          type="checkbox"
          v-model="midfixLocal"
          @change="onMidfixChange()"
        />
        <label class="form-check-label" for="search-simple-midfix">
          {{ $t("search.simple.midfix") }}
        </label>
        <HelpBadge :text="$t('search.simple.midfix.help')" />
      </div>

      <div class="form-check">
        <input
          id="search-simple-suffix"
          class="form-check-input"
          type="checkbox"
          v-model="suffixLocal"
        />
        <label class="form-check-label" for="search-simple-suffix">
          {{ $t("search.simple.suffix") }}
        </label>
        <HelpBadge :text="$t('search.simple.suffix.help')" />
      </div>
    </div>

    <!-- Options 2 -->
    <div class="d-flex justify-content-center gap-4 my-2">
      <div class="form-check">
        <input
          id="search-simple-free-order"
          class="form-check-input"
          type="checkbox"
          v-model="freeOrder"
        />
        <label class="form-check-label" for="search-simple-free-order">
          {{ $t("search.simple.free_order") }}
        </label>
        <HelpBadge :text="$t('search.simple.free_order.help')" />
      </div>

      <div class="form-check">
        <input
          id="search-simple-ignore-case"
          class="form-check-input"
          type="checkbox"
          v-model="ignoreCase"
        />
        <label class="form-check-label" for="search-simple-ignore-case">
          {{ $t("search.simple.ignore_case") }}
        </label>
      </div>
    </div>
  </form>
</template>
