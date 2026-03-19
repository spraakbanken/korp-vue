<script setup lang="ts">
import { watchImmediate } from "@vueuse/core"
import { corpusListing } from "@/core/corpora/corpusListing"
import { useReactiveCorpusSelection } from "./useReactiveCorpusSelection"
import { useAppStore } from "@/store/useAppStore"
import CorpusSelectionDialog from "./CorpusSelectionDialog.vue"
import { useLocale } from "@/i18n/useLocale"
import ModalDialog from "@/components/ModalDialog.vue"
import { ref, reactive, watchEffect } from "vue"
import { useAuth } from "@/auth/useAuth"
import { getTimeData } from "@/core/backend/timedata"
import { initCorpusStructure } from "@/core/corpora/corpora"
import CorpusSelectorTree from "./CorpusSelectorTree.vue"

const root = reactive(initCorpusStructure(corpusListing.corpora))

const corpusSelection = useReactiveCorpusSelection()
const store = useAppStore()
const auth = useAuth()
const { locObj } = useLocale()

const selection = ref<string[]>([])

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
  store.corpus = corpusListing.corpora.filter((corpus) => {
    return ! corpus.protected || auth.hasCredential(corpus.id.toUpperCase())
  }).map((corpus) => corpus.id)
}

function selectNone() {
  store.corpus = []
}

watchEffect(() => (selection.value = store.corpus))

</script>

<template>
  <div>
    <CorpusSelectionDialog @resolve="resolveValidation" />

    <div class="d-grid">
      <button
        class="btn btn-outline-secondary"
        data-bs-toggle="modal"
        data-bs-target="#corpus-selector"
      >
        {{ store.corpus.length }} {{ $t("corpora") }}
      </button>
    </div>

    <ModalDialog id="corpus-selector" :title="$t('corpora')">
      <div class="mb-3">
        <button type="button" class="btn btn-sm btn-secondary me-2" @click="selectAll()">
          {{ $t("corpus.selection.select_all") }}
        </button>
        <button type="button" class="btn btn-sm btn-secondary" @click="selectNone()">
          {{ $t("corpus.selection.select_none") }}
        </button>
      </div>
      <CorpusSelectorTree :node="root" />
    </ModalDialog>
  </div>
</template>
