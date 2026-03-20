<script setup lang="ts">
import {
  getAllCorpora,
  type ChooserFolder,
  type ChooserFolderRoot,
  type ChooserFolderSub,
} from "@/core/corpora/corpora"
import { useAuth } from "@/auth/useAuth"
import { computed, ref, watch } from "vue"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { corpusListing } from "@/core/corpora/corpusListing"
import type { LangString } from "@/core/model/locale"

const { locObj } = useLocale()

const auth = useAuth()
const store = useAppStore()

let updateCounter = 0

const extendedFolders = ref(new Set())

const props = defineProps<{
  node: ChooserFolderRoot | ChooserFolderSub | ChooserFolder
}>()

const sortOnTitle = <T extends { id: string; title?: LangString }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const titleA = a.title ? locObj(a.title) : a.id
    const titleB = b.title ? locObj(b.title) : b.id
    return titleA.localeCompare(titleB)
  })
}

const sortedFolders = computed(() => {
  return sortOnTitle(props.node.subFolders)
})

const sortedCorpora = computed(() => {
  return sortOnTitle(props.node.corpora)
})

watch(
  () => store.corpus,
  () => {
    updateCheckboxes()
  },
  { deep: true },
)
updateCheckboxes()

function updateCheckboxes() {
  // Folders first
  props.node.subFolders.forEach((folder) => {
    // 1. get the list of all corpora for each subfolder
    const corporaIds = getAllCorpora(folder)
    // 2. check the status of each corpora in the app store for each folder
    const selectedCorporaIds = corporaIds.filter((corpusId) => {
      return store.corpus.indexOf(corpusId) !== -1
    })
    if (corporaIds.length === selectedCorporaIds.length) {
      folder.selected = "all"
    } else if (selectedCorporaIds.length > 0) {
      folder.selected = "some"
      // Temp. hack for making sure the intermediate folders are
      // opened when the app starts, but not each time a checkbox
      // change happens, which right now is when the store.corpus
      // update happens for the SECOND time (unclear why):
      if (updateCounter === 1) extendedFolders.value.add(folder.id)
    } else {
      folder.selected = "none"
    }
  })
  // Then the corpora
  props.node.corpora.forEach((corpus) => {
    corpus.selected = store.corpus.indexOf(corpus.id) !== -1
  })
  updateCounter++
}

// Extened/collapsed
function toggleFolder(id: string) {
  if (extendedFolders.value.has(id)) {
    extendedFolders.value.delete(id)
  } else {
    extendedFolders.value.add(id)
  }
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
    <div v-for="subFolder in sortedFolders" :key="subFolder.id">
      <div>
        <div class="flex">
          <fa-icon
            :icon="`fa-solid ${extendedFolders.has(subFolder.id) ? 'fa-caret-down' : 'fa-caret-right'}`"
            @click="toggleFolder(subFolder.id)"
          />
          <label
            style="user-select: none"
            @click.prevent="toggleFolderSelection(subFolder, $event.altKey || $event.ctrlKey)"
            @keydown.space.prevent="
              toggleFolderSelection(subFolder, $event.altKey || $event.ctrlKey)
            "
            @keydown.enter.shift.prevent="toggleFolder(subFolder.id)"
          >
            <input
              type="checkbox"
              style="pointer-events: none"
              :checked="subFolder.selected !== 'none'"
              :indeterminate="subFolder.selected === 'some'"
              class="me-1"
            />{{ locObj(subFolder.title) }}
            <span style="color: gray">({{ subFolder.numberOfChildren }})</span>
          </label>
        </div>
      </div>
      <CorpusSelectorTree v-if="extendedFolders.has(subFolder.id)" :node="subFolder" class="ms-3" />
    </div>
    <!-- List of corpora -->
    <div
      v-for="corpus in sortedCorpora"
      class="d-flex bg-secondary-subtle mb-1 ps-1"
      style="margin-left: 16px"
    >
      <label
        style="flex: 1 1 0%"
        @click.prevent="toggleCorpusSelection(corpus, $event.altKey || $event.ctrlKey)"
        @keydown.space.prevent="toggleCorpusSelection(corpus, false)"
      >
        <fa-icon
          v-if="corpus.protected && !auth.hasCredential(corpus.id)"
          icon="fa-solid fa-lock"
          size="sm"
        />
        <input
          v-else
          type="checkbox"
          style="pointer-events: none"
          class="me-1"
          :checked="corpus.selected"
        />{{ locObj(corpus.title) }}
      </label>
      <fa-icon
        v-if="corpus.protected && auth.hasCredential(corpus.id)"
        icon="fa-solid fa-lock-open"
        class="m-1"
      />
      <fa-icon icon="fa-solid fa-circle-info" class="m-1" />
    </div>
  </div>
</template>
