<script setup lang="ts">
import { computedAsync, watchImmediate } from "@vueuse/core"
import { corpusListing } from "@/core/corpora/corpusListing"
import { useReactiveCorpusSelection } from "./useReactiveCorpusSelection"
import { useAppStore } from "@/store/useAppStore"
import CorpusSelectionDialog from "./CorpusSelectionDialog.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import { ref, reactive, defineAsyncComponent } from "vue"
import { useAuth } from "@/auth/useAuth"
import { getTimeData } from "@/core/backend/timedata"
import { initCorpusStructure } from "@/core/corpora/corpora"
import CorpusSelectorTree from "./CorpusSelectorTree.vue"
import SelectionSummary from "./SelectionSummary.vue"
import type { Corpus } from "@/core/config/corpusConfig.types"
import CorpusDetails from "./CorpusDetails.vue"

const root = reactive(initCorpusStructure(corpusListing.corpora.filter((corpus) => !corpus.hide)))

const corpusSelection = useReactiveCorpusSelection()
const store = useAppStore()
const auth = useAuth()

const CorpusTimeGraph = defineAsyncComponent(() => import("./CorpusTimeGraph.vue"))

/** Corpus to show details for, if any */
const corpus = ref<Corpus>()
const timeData = computedAsync(() => getTimeData())

/** Runs after corpus selection has been checked for access etc. */
function resolveValidation(ids: string[]) {
  store.corpus = ids

  // Keep global corpusSelection in sync with selected ids.
  watchImmediate(
    () => store.corpus,
    () => corpusSelection.pickFrom(corpusListing, store.corpus),
  )

  // Await time distribution data (already started in the App component)
  // and then make sure time interval attributes are added
  getTimeData().then(() => corpusSelection.updateAttributes())
}

function selectAll() {
  store.corpus = corpusListing.corpora
    .filter((corpus) => {
      return !corpus.protected || auth.hasCredential(corpus.id.toUpperCase())
    })
    .map((corpus) => corpus.id)
}

function selectNone() {
  store.corpus = []
}
</script>

<template>
  <div class="d-flex justify-content-center">
    <CorpusSelectionDialog @resolve="resolveValidation" />

    <div class="card p-2 flex-row align-items-center gap-2">
      <fa-icon icon="fa-solid fa-book" />
      <SelectionSummary :total-corpora="root.numberOfChildren" :total-tokens="root.tokens" />
      <button
        class="btn btn-primary btn-sm stretched-link"
        data-bs-toggle="modal"
        data-bs-target="#corpus-selector"
      >
        {{ $t("corpus.selection.label") }}
      </button>
    </div>

    <ModalDialog id="corpus-selector" :title="$t('corpora')" @close="corpus = undefined">
      <div class="mb-3 hstack gap-2 justify-content-between">
        <SelectionSummary :total-corpora="root.numberOfChildren" :total-tokens="root.tokens" />

        <CorpusTimeGraph v-if="timeData?.byYear?.length" :data="timeData" />

        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-secondary" @click="selectAll()">
            {{ $t("corpus.selection.select_all") }}
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="selectNone()">
            {{ $t("corpus.selection.select_none") }}
          </button>
        </div>
      </div>

      <CorpusDetails v-if="corpus" :corpus @close="corpus = undefined" />
      <CorpusSelectorTree v-else :node="root" @inspect="corpus = $event" />
    </ModalDialog>
  </div>
</template>
