<script lang="ts" setup>
/** Search panel for parallel mode, like Extended but with multiple queries by language */
import settings from "@/core/config"
import { computed, ref, watchEffect } from "vue"
import QueryBuilder from "./extended/QueryBuilder.vue"
import { createCondition } from "@/core/cqp/cqp"
import { getAvailableLangs, getParallelCqp, type ParallelQuery } from "@/core/search/parallel"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import type { CorpusSetParallel } from "@/core/corpora/CorpusSetParallel"
import { useAppStore } from "@/store/useAppStore"
import { uniq } from "lodash-es"
import { corpusListing } from "@/core/corpora/corpusListing"

/** Reactive corpus selection instance */
const corpusSelection = useReactiveCorpusSelection() as CorpusSetParallel
const store = useAppStore()

/** Creates a new query */
const newQuery = (lang: string): ParallelQuery => ({
  lang,
  negative: false,
  query: [{ and_block: [[createCondition("")]] }],
})

/** Query structures by language, being edited */
const queries = ref<ParallelQuery[]>([newQuery(settings["start_lang"]!)])

/** Languages in use for queries */
const langs = computed(() => uniq(queries.value.map((query) => query.lang)))

/** Get languages available for each query index */
const availableLangs = computed(() => {
  // Mention corpus selection to trigger recalculation on changes
  void corpusSelection
  return getAvailableLangs(corpusSelection, queries.value)
})

/** Unused languages available for a new query */
const unusedLangs = computed(() => availableLangs.value[availableLangs.value.length - 1]!)

/** Sync language choices to corpus listings */
watchEffect(() => {
  ;(corpusListing as CorpusSetParallel).setLangs(langs.value)
  corpusSelection.setLangs(langs.value)
})

/** Handle submitting the search form */
function submit() {
  const cqp = getParallelCqp(queries.value)
  store.activeSearch = { cqp }
}
</script>

<template>
  <section class="d-flex flex-column align-items-center">
    <div class="p-4 bg-body border">
      <form @submit.prevent="submit" class="vstack gap-4">
        <!-- Dynamic listing of query builders by language -->
        <div
          v-for="(query, i) in queries"
          :key="query.lang"
          class="d-flex flex-column align-items-start gap-2"
        >
          <!-- Query header -->
          <div class="hstack gap-2">
            <!-- Language select -->
            <select v-model="query.lang" class="form-select w-auto" required>
              <option v-for="lang in availableLangs[i]" :key="lang" :value="lang">
                {{ $t(`lang.${lang}`) }}
              </option>
            </select>

            <!-- Negative toggle -->
            <div v-if="i > 0" class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                v-model="query.negative"
                :id="`search-parallel-${i}-negative`"
              />
              <label class="form-check-label" :for="`search-parallel-${i}-negative`">
                {{ $t("search.parallel.negative") }}
              </label>
            </div>

            <!-- Remove query button -->
            <button
              type="button"
              class="btn-close ms-2"
              :aria-label="$t('search.parallel.remove_query')"
              @click="queries = queries.filter((q) => q !== query)"
            />
          </div>

          <!-- Query builder -->
          <QueryBuilder v-model="query.query" />
        </div>

        <!-- Button to add new query -->
        <div>
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="unusedLangs.length === 0"
            @click="queries.push(newQuery(unusedLangs[0]!))"
          >
            + {{ $t("search.parallel.add_query") }}
          </button>
        </div>

        <!-- Instructions -->
        <div class="small text-muted text-center">
          {{ $t("search.parallel.instructions") }}
        </div>

        <!-- Search button -->
        <div class="hstack justify-content-center gap-2">
          <div class="btn-group">
            <input type="submit" :value="$t('search')" class="btn btn-primary" />
          </div>
        </div>
      </form>
    </div>
  </section>
</template>
