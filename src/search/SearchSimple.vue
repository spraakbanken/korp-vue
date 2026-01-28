<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { splitFirst } from "@/core/util"
import { storeToRefs } from "pinia"
import { syncRefs, until, watchImmediate } from "@vueuse/core"
import { stringify, supportsInOrder } from "@/core/cqp/cqp"
import { buildSimpleLemgramCqp, buildSimpleWordCqp } from "@/core/search/simple"
import LemgramAutocomplete, { type LemgramAutocompleteModel } from "./LemgramAutocomplete.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import GlobalFilters from "./GlobalFilters.vue"
import { useReactiveFilterManager } from "./useReactiveFilterManager"

const store = useAppStore()
const { search, prefix, suffix, in_order, isCaseInsensitive, simpleCqp } = storeToRefs(store)
const filterManager = useReactiveFilterManager()

const prefixLocal = ref(prefix.value)
const midfixLocal = ref(false)
const suffixLocal = ref(suffix.value)
const freeOrder = ref(!in_order.value)
const ignoreCase = ref(isCaseInsensitive.value)
const lemgram = ref<LemgramAutocompleteModel>({ type: "word", value: "" })
const isFilterReady = ref(false)

/** Trimmed autocomplete input */
const input = computed<LemgramAutocompleteModel>(() => ({
  type: lemgram.value.type,
  value: lemgram.value.value.trim(),
}))

/** Reactive query model built from input */
const query = computed(() => {
  const { type, value } = input.value
  return type == "lemgram"
    ? buildSimpleLemgramCqp(value, prefixLocal.value, suffixLocal.value)
    : buildSimpleWordCqp(value, prefixLocal.value, suffixLocal.value, ignoreCase.value)
})

/** Reactive CQP representation of the query */
const cqp = computed(() => stringify(filterManager.mergeToCqp(query.value)))

syncRefs(cqp, simpleCqp)

// Flag when the filter manager is ready, so that the initial search can include the filter selection.
watch(filterManager, () => (isFilterReady.value = true))

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
  commitSearch()
})

function onMidfixChange() {
  prefixLocal.value = midfixLocal.value
  suffixLocal.value = midfixLocal.value
}

function submit() {
  // Sync from form to store when submitting.
  store.prefix = prefixLocal.value
  store.suffix = suffixLocal.value
  store.in_order = !freeOrder.value || !supportsInOrder(query.value)
  store.isCaseInsensitive = ignoreCase.value

  const { type, value } = input.value
  store.search = `${type}|${value}`
  store.page = 0
  commitSearch()
}

/** Declare query as the active search */
async function commitSearch() {
  const { type, value } = input.value
  if (!value) return

  // Let filter manager finish settling, so that the filter selection can be included in the initial search query.
  await until(isFilterReady).toBe(true, { timeout: 1000 })

  store.activeSearch = { type, cqp: cqp.value }
}
</script>

<template>
  <form @submit.prevent="submit" class="text-center">
    <GlobalFilters class="mb-4" />

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
          <HelpBadge :text="$t('search.simple.prefix.help')" />
        </label>
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
          <HelpBadge :text="$t('search.simple.midfix.help')" />
        </label>
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
          <HelpBadge :text="$t('search.simple.suffix.help')" />
        </label>
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
          :disabled="!supportsInOrder(query)"
        />
        <label class="form-check-label" for="search-simple-free-order">
          {{ $t("search.simple.free_order") }}
          <HelpBadge :text="$t('search.simple.free_order.help')" />
        </label>
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
