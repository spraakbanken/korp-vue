<script setup lang="ts">
import { getAllCorpora, type ChooserFolder, type ChooserFolderSub } from "@/core/corpora/corpora"
import { useAuth } from "@/auth/useAuth"
import { watch } from "vue"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusListing } from "@/core/corpora/corpusListing"
import type { LangString } from "@/core/model/locale"

const props = defineProps<{
  node: ChooserFolder
}>()

defineEmits<{
  (e: "inspect", corpus: Corpus): void
}>()

const { locObj } = useLocale()
const auth = useAuth()
const store = useAppStore()

const sortOnTitle = <T extends { id: string; title?: LangString }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const titleA = a.title ? locObj(a.title) : a.id
    const titleB = b.title ? locObj(b.title) : b.id
    return titleA.localeCompare(titleB)
  })
}

watch(
  () => store.corpus,
  () => updateCheckboxes(),
  { deep: true },
)
updateCheckboxes()

function updateCheckboxes() {
  // Folders first
  props.node.subFolders.forEach((folder) => {
    // 1. get the list of all corpora for each subfolder
    const corporaIds = getAllCorpora(folder)
    // 2. check the status of each corpora in the app store for each folder
    const selectedCorporaIds = corporaIds.filter((corpusId) => store.corpus.includes(corpusId))
    if (corporaIds.length === selectedCorporaIds.length) {
      folder.selected = "all"
    } else if (selectedCorporaIds.length > 0) {
      folder.selected = "some"
    } else {
      folder.selected = "none"
    }
    // Set expanded status on first run, when it's still undefined, so partially selected folders are expanded by default
    if (folder.expanded === undefined) folder.expanded = folder.selected == "some"
  })
  // Then the corpora
  props.node.corpora.forEach((corpus) => {
    corpus.selected = store.corpus.indexOf(corpus.id) !== -1
  })
}

function toggleFolderSelection(folder: ChooserFolderSub, exclusive: boolean) {
  const corporaIds = getAllCorpora(folder)
  if (exclusive) {
    store.corpus = corporaIds
  } else {
    if (folder.selected === "none") {
      // Select all available corpora in the folder, since at least none was selected
      store.corpus = [...new Set([...store.corpus, ...corporaIds])].filter((corpusId) => {
        const corpus = corpusListing.get(corpusId)
        return !corpus.protected || auth.hasCredential(corpusId)
      })
    } else {
      // Unselect all corpora, since at least one is selected
      const idSet = new Set(corporaIds)
      store.corpus = store.corpus.filter((corpusId) => !idSet.has(corpusId))
    }
  }
}

function toggleCorpusSelection(corpus: Corpus, exclusive: boolean) {
  // REM: An 'exclusive' click (alt-click or ctrl-click) deselects everything else
  if (exclusive) {
    store.corpus = [corpus.id]
  } else {
    if (store.corpus.indexOf(corpus.id) !== -1) {
      store.corpus = store.corpus.filter((corpusId) => corpusId !== corpus.id)
    } else {
      store.corpus.push(corpus.id)
    }
  }
}
</script>

<template>
  <div>
    <!-- List of folders -->
    <details
      v-for="folder in sortOnTitle(props.node.subFolders)"
      :key="folder.id"
      :open="folder.expanded"
      class="ps-1"
      :class="{ 'bg-primary-subtle': folder.selected == 'all' }"
      @toggle="folder.expanded = ($event.target as any).open"
    >
      <!-- Folder row -->
      <summary class="d-block">
        <label
          @click.prevent="toggleFolderSelection(folder, $event.altKey || $event.ctrlKey)"
          @keydown.space.prevent="toggleFolderSelection(folder, $event.altKey || $event.ctrlKey)"
        >
          <input
            type="checkbox"
            :checked="folder.selected !== 'none'"
            :indeterminate="folder.selected === 'some'"
            class="form-check-input me-1 pe-none"
          />
        </label>
        <fa-icon
          :icon="`fa-solid ${folder.expanded ? 'fa-folder-open' : 'fa-folder'}`"
          class="me-1 text-warning"
        />
        {{ locObj(folder.title) }}
        <span class="text-muted">({{ folder.numberOfChildren }})</span>
      </summary>

      <!-- Folder contents -->
      <CorpusSelectorTree
        :node="folder"
        class="ms-2 border-start rounded-bottom"
        style="padding-inline-start: 0.9rem"
        @inspect="$emit('inspect', $event)"
      />
    </details>

    <!-- List of corpora -->
    <div
      v-for="corpus in sortOnTitle(props.node.corpora)"
      :key="corpus.id"
      class="corpus d-flex px-1"
      :class="{ 'bg-primary-subtle': corpus.selected }"
    >
      <label
        class="flex-grow-1"
        style="cursor: pointer"
        @click.prevent="toggleCorpusSelection(corpus, $event.altKey || $event.ctrlKey)"
        @keydown.space.prevent="toggleCorpusSelection(corpus, false)"
      >
        <fa-icon
          v-if="corpus.protected && !auth.hasCredential(corpus.id)"
          icon="fa-solid fa-lock"
          size="sm"
          class="me-2 text-danger"
        />
        <input
          v-else
          type="checkbox"
          class="form-check-input me-2 pe-none"
          :checked="corpus.selected"
        />{{ locObj(corpus.title) }}
      </label>
      <fa-icon
        v-if="corpus.protected && auth.hasCredential(corpus.id)"
        icon="fa-solid fa-lock-open"
        class="m-1 text-success"
      />
      <fa-icon
        icon="fa-solid fa-circle-info"
        class="my-1 text-info"
        style="cursor: pointer"
        @click="$emit('inspect', corpus)"
      />
    </div>
  </div>
</template>

<style scoped>
details:not(.bg-primary-subtle) > summary:hover,
.corpus:not(.bg-primary-subtle):hover {
  background-color: var(--bs-tertiary-bg);
}

.text-bg-primary * {
  color: #fff !important;
}
</style>
