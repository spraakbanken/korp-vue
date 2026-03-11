<script lang="ts" setup>
/** Search panel for parallel mode, like Extended but with multiple queries by language */
import settings from "@/core/config"
import { computed, ref } from "vue"
import QueryBuilder from "./extended/QueryBuilder.vue"
import type { CqpQuery } from "@/core/cqp/cqp.types"
import { createCondition } from "@/core/cqp/cqp"
import { getEnabledLangs } from "@/core/search/parallel"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import type { CorpusSetParallel } from "@/core/corpora/CorpusSetParallel"

type Query = {
  lang: string
  cqp: string
  query: CqpQuery
  negative?: boolean
}

const corpusSelection = useReactiveCorpusSelection() as CorpusSetParallel

const newQuery = (lang?: string): Query => ({
  lang: lang || settings["start_lang"]!,
  cqp: "[]",
  query: [{ and_block: [[createCondition("")]] }],
})

const queries = ref<Query[]>([newQuery()])

const getLangs = (i: number) => getEnabledLangs(corpusSelection, queries.value, i)
const unusedLangs = computed(() => getLangs(queries.value.length))

function submit() {}
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
          <!-- Language select -->
          <div class="hstack">
            <select v-model="query.lang" class="form-select w-auto" required>
              <option v-for="lang in getLangs(i)" :key="lang" :value="lang">
                {{ $t(`lang.${lang}`) }}
              </option>
            </select>

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
            @click="queries.push(newQuery(unusedLangs[0]))"
            :disabled="unusedLangs.length === 0"
          >
            + {{ $t("search.parallel.add_query") }}
          </button>
        </div>

        <!-- Instructions -->
        <div class="small text-muted text-center">
          {{ $t("search.extended.instructions") }}
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
