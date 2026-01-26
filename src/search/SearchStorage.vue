<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import { useSearchStorage, type SavedSearch } from "./useSearchStorage"
import { storeToRefs } from "pinia"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { ref } from "vue"
import { watchImmediate } from "@vueuse/core"
import SearchQueryCard from "./SearchQueryCard.vue"

const store = useAppStore()
const { searches, saveSearch, removeSearch } = useSearchStorage()

const { activeSearch } = storeToRefs(store)
const activeSearchCorpora = ref<string[]>([])
const label = ref("")
const searchSelected = ref<SavedSearch | null>(searches.value[0] || null)

// Remember what corpora were selected when a search was performed
watchImmediate(activeSearch, () => (activeSearchCorpora.value = corpusSelection.getIds()))

// Automatically select latest saved search
watchImmediate(
  searches,
  () => (searchSelected.value = searches.value[searches.value.length - 1] || null),
  { deep: true },
)

// TODO Prevent duplicate labels or queries
function save() {
  if (!activeSearch.value) return
  saveSearch(activeSearch.value.cqp, label.value, activeSearchCorpora.value)
  label.value = ""
}

function remove(search: SavedSearch) {
  removeSearch(search)
  // Update selection
  searchSelected.value = searches.value[0] || null
}
</script>

<template>
  <div class="container-max-md">
    <div class="mb-2">{{ $t("search.storage.help") }}</div>
    <form class="row" @submit.prevent="save()">
      <div class="col-3">
        <strong>{{ $t("search.storage.current") }}</strong>
      </div>
      <div class="col-9 d-flex flex-column gap-2">
        <SearchQueryCard
          v-if="activeSearch"
          :cqp="activeSearch.cqp"
          :corpusIds="activeSearchCorpora"
        />
        <div v-else class="text-muted">
          {{ $t("search.storage.none") }}
        </div>
        <div>
          <div class="form-label">{{ $t("search.storage.label") }}</div>
          <div class="d-flex align-items-baseline gap-2">
            <input
              type="text"
              v-model="label"
              class="form-control w-auto"
              :disabled="!activeSearch"
            />
            <button type="submit" class="btn btn-primary mb-2" :disabled="!activeSearch">
              {{ $t("search.storage.save") }}
            </button>
          </div>
        </div>
      </div>
    </form>
    <hr />
    <div class="row">
      <div class="col-3">
        <strong>{{ $t("search.storage.saved") }}</strong>
      </div>
      <div class="col-9 d-flex flex-column gap-2">
        <div>
          <select class="form-select" v-model="searchSelected" :disabled="!searches.length">
            <option
              v-for="query in searches"
              :key="`${query.label} ${query.cqp} ${query.corpora}`"
              :value="query"
            >
              {{ query.label }}
            </option>
          </select>
        </div>

        <template v-if="searchSelected">
          <SearchQueryCard :cqp="searchSelected.cqp" :corpusIds="searchSelected.corpora" />

          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              class="btn btn-danger"
              :disabled="!searchSelected"
              @click="remove(searchSelected!)"
            >
              {{ $t("search.storage.delete") }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
