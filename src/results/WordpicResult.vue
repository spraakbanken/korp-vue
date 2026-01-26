<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate, whenever } from "@vueuse/core"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useDynamicTabs } from "./useDynamicTabs"
import { debounce } from "lodash"
import { storeToRefs } from "pinia"
import { RelationsProxy, type RelationsQuery } from "@/core/backend/proxy/RelationsProxy"
import type { RelationsSort } from "@/core/backend/types/relations"
import {
  formatWordOrLemgram,
  type WordPicture,
  type WordPictureSectionHeading,
} from "@/core/wordpic"
import { getWordPictureConfig } from "@/core/config"
import WordpicRow from "./WordpicRow.vue"
import { Lemgram } from "@/core/lemgram"

const UPDATE_DELAY_MS = 500

const props = defineProps<{
  active: boolean
}>()

const store = useAppStore()
const { t } = useI18n()
const { createTab } = useDynamicTabs()

const cqp = computed(() => store.activeSearch?.cqp || "[]")
const data = ref<WordPicture>()
const { activeSearch } = storeToRefs(store)
const errorMessage = ref<string>()
const limit = ref<number>(15)
const sort = ref<RelationsSort>("mi")
const sortLocal = ref<RelationsSort>("mi")

const proxy = new RelationsProxy()

// Activate when opening tab first time
whenever(
  () => props.active,
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

const onOptionsChange = debounce(() => {}, UPDATE_DELAY_MS)
</script>

<template>
  <div class="vstack gap-2">
    <div class="bg-secondary-subtle p-2 d-flex gap-4 align-items-baseline">
      <label class="d-flex align-items-baseline gap-1"> </label>
    </div>

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
