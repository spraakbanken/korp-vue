<script setup lang="ts">
import { watchImmediate } from "@vueuse/core"
import { corpusListing, corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import CorpusSelectionDialog from "./CorpusSelectionDialog.vue"
import { useLocale } from "@/i18n/useLocale"
import ModalDialog from "@/components/ModalDialog.vue"
import { ref, watchEffect } from "vue"
import { useAuth } from "@/auth/useAuth"

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

    <ModalDialog id="corpus-selector" :title="$t('corpora')" @close="store.corpus = selection">
      <select multiple v-model="selection" size="8">
        <option
          v-for="corpus of corpusListing.corpora"
          :key="corpus.id"
          :value="corpus.id"
          :disabled="corpus?.limited_access && !auth.hasCredential(corpus.id.toUpperCase())"
        >
          {{ locObj(corpus.title) }}
        </option>
      </select>
    </ModalDialog>
  </div>
</template>
