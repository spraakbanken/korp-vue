<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { useElementVisibility, watchImmediate, whenever } from "@vueuse/core"
import { computed, ref, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "./useDynamicTabs"
import { debounce } from "lodash-es"
import { storeToRefs } from "pinia"
import { RelationsProxy, type RelationsQuery } from "@/core/backend/proxy/RelationsProxy"
import type { RelationsSort } from "@/core/backend/types/relations"
import { formatWordOrLemgram, type MatchedRelation, type WordPicture } from "@/core/wordpic"
import WordpicRow from "./WordpicRow.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import { WordpicExampleTask } from "@/core/task/WordpicExampleTask"

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]
const UPDATE_DELAY_MS = 500

const store = useAppStore()
const { t } = useI18n()
const { createTab } = useDynamicTabs()

const containerEl = useTemplateRef("container")
const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<WordPicture>()
const { activeSearch } = storeToRefs(store)
const errorMessage = ref<string>()
const isVisible = useElementVisibility(containerEl)
const limit = ref(LIMITS[0])
const showPos = ref(false)
const sort = ref<RelationsSort>("mi")
const sortLocal = ref<RelationsSort>("mi")

const proxy = new RelationsProxy()

// Activate when opening tab first time
whenever(
  isVisible,
  () => {
    // Start watching the active search query
    watchImmediate(activeSearch, () => {
      // Initial corpus selection may not have settled yet.
      if (corpusSelection.corpora.length) doSearch()
      else setTimeout(() => doSearch())
    })
  },
  { once: true, immediate: true },
)

async function doSearch() {
  const query = getValidQuery()
  if (!query) return

  proxy.abort()
  data.value = await proxy.makeRequest(query.type, query.word, sortLocal.value)

  // Sort affects request as well as presentation. Use it for presentation only after response data is ready.
  sort.value = sortLocal.value
}

function getValidQuery(): RelationsQuery | undefined {
  try {
    return RelationsProxy.parseCqp(cqp.value)
  } catch (e) {
    console.warn(e)
    errorMessage.value = t("wordpic.query.incompatible")
    return undefined
  }
}

// Debounce repeated request to avoid lag when changing options quickly, e.g. by keyboard.
const onOptionsChange = debounce(() => {
  doSearch()
}, UPDATE_DELAY_MS)

function onClickRow(row: MatchedRelation): void {
  const task = new WordpicExampleTask(row.source.join())
  createTab(t("result.kwic"), task)
}
</script>

<template>
  <div class="vstack gap-2" ref="container">
    <!-- Options bar -->
    <div class="bg-secondary-subtle p-2 d-flex gap-4 align-items-baseline">
      <label class="d-flex gap-2 align-items-baseline">
        {{ $t("result.wordpic.sort") }}:
        <select
          class="form-select form-select-sm w-auto"
          v-model="sortLocal"
          @change="onOptionsChange"
        >
          <option value="freq">{{ $t("stat.freq") }}</option>
          <option value="mi">{{ $t("stat.mi") }}</option>
        </select>
        <HelpBadge :text="$t('result.wordpic.sort.help')" />
      </label>

      <label class="d-flex gap-2 align-items-baseline">
        {{ $t("result.wordpic.limit") }}:
        <select class="form-select form-select-sm w-auto" v-model="limit">
          <option v-for="n in LIMITS" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

      <label class="form-check form-check-label">
        <input type="checkbox" v-model="showPos" class="form-check-input" />
        {{ $t("result.wordpic.show_pos") }}
      </label>
    </div>

    <!-- Wordpic cards -->
    <div v-if="data" class="d-flex flex-wrap gap-2">
      <!-- Cards with headings like "dog (noun)"; same word can have multiple POS -->
      <div
        v-for="section of data.getData()"
        :key="`${section.heading.word} ${section.heading.pos}`"
        class="card p-2 bg-body-tertiary"
      >
        <h4
          class="mb-3d"
          v-html="formatWordOrLemgram(section.heading.word, section.heading.pos, $t, true)"
        />

        <div class="d-flex flex-wrap gap-5">
          <div v-for="table in section.tables" :key="table.index">
            <!-- A table header with relation names -->
            <div class="hstack mb-2 justify-content-center">
              <div
                v-for="(column, i) in table.columnsBefore"
                :key="i"
                class="p-2"
                :style="{ backgroundColor: column.config.color }"
              >
                {{ $t(column.config.alt_label || `rel.${column.config.rel.toLowerCase()}`) }}
              </div>
              <div
                class="p-2 fw-bold"
                v-html="formatWordOrLemgram(section.heading.word, section.heading.pos, $t)"
              />
              <div
                v-for="(column, i) in table.columnsAfter"
                :key="i"
                class="p-2"
                :style="{ backgroundColor: column.config.color }"
              >
                {{ $t(column.config.alt_label || `rel.${column.config.rel.toLowerCase()}`) }}
              </div>
            </div>

            <!-- A column for each relation -->
            <div class="d-flex align-items-start">
              <div
                v-for="(column, i) in table.columns"
                :key="i"
                :style="{ backgroundColor: column.config.color }"
              >
                <table class="m-1">
                  <WordpicRow
                    v-for="(row, j) in column.rows.slice(0, limit)"
                    :key="j"
                    :row="row"
                    :sort="sort"
                    :showPos
                    @clickRow="onClickRow"
                  />
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
