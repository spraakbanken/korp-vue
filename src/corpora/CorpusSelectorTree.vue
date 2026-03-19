<script setup lang="ts">
import { getAllCorpora, type ChooserFolder, type ChooserFolderRoot, type ChooserFolderSub } from '@/core/corpora/corpora';
import { useAuth } from "@/auth/useAuth"
import { computed, ref, watch } from 'vue'
import { useLocale } from '@/i18n/useLocale'
import { useAppStore } from "@/store/useAppStore"
import type { Corpus } from '@/core/config/corpusConfig.types'
import { corpusListing } from '@/core/corpora/corpusListing'
import type { LangString } from '@/core/model/locale';

const { locObj } = useLocale()

const auth = useAuth()
const store = useAppStore()

let updateCounter = 0

const extendedFolders = ref(new Set())

const props = defineProps<{
  node: ChooserFolderRoot | ChooserFolderSub | ChooserFolder,
}>()

const sortOnTitle = <T extends { id: string; title?: LangString } >(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const titleA = a.title ? locObj(a.title) : a.id
    const titleB = b.title ? locObj(b.title) : b.id
    return titleA.localeCompare(titleB)
  });
};

const sortedFolders = computed(() => {
  return sortOnTitle(props.node.subFolders)
});

const sortedCorpora = computed(() => {
  return sortOnTitle(props.node.corpora)
});

watch(
  () => store.corpus,
  () => {
    updateCheckboxes()
  },
  { deep: true }
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
    if (folder.selected === 'none') {
      // Select all available corpora in the folder, since at least none was selected
      store.corpus = [...new Set([...store.corpus, ...corporaIds])].filter((corpusId) => {
        const corpus = corpusListing.get(corpusId)
        return ! corpus.protected || auth.hasCredential(corpusId.toUpperCase())
      })
    } else {
      // Unselect all corpora, since at least one is selected
      const idSet = new Set(corporaIds)
      store.corpus = store.corpus.filter(corpusId => !idSet.has(corpusId))
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
          <div
            style="display:inline"
            class="me-1"
            @click="toggleFolder(subFolder.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16" :style="{'transform': extendedFolders.has(subFolder.id) ? 'rotate(90deg)' : ''}">
              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
            </svg>
          </div>
          <label
           style="user-select:none"
           @click.prevent="toggleFolderSelection(subFolder, $event.altKey || $event.ctrlKey)"
           @keydown.space.prevent="toggleFolderSelection(subFolder, $event.altKey || $event.ctrlKey)"
           @keydown.enter.shift.prevent="toggleFolder(subFolder.id)"
          >
            <input
              type="checkbox"
              style="pointer-events:none"
              :checked="subFolder.selected !== 'none'"
              :indeterminate="subFolder.selected === 'some'"
              class="me-1"
            >{{locObj(subFolder.title)}} <span style="color:gray">({{subFolder.numberOfChildren}})</span>
          </label>
        </div>

      </div>
      <CorpusSelectorTree
        style="margin-left:1.5rem"
        v-if="extendedFolders.has(subFolder.id)"
        :node="subFolder" 
      />
    </div>
    <!-- List of corpora -->
    <div v-for="corpus in sortedCorpora" class="d-flex bg-secondary-subtle mb-1 ps-1" style="margin-left:16px">
      <label
        style="flex: 1 1 0%"
        @click.prevent="toggleCorpusSelection(corpus, $event.altKey || $event.ctrlKey)"
        @keydown.space.prevent="toggleCorpusSelection(corpus, false)"
      >
        <div v-if="corpus.protected && !auth.hasCredential(corpus.id.toUpperCase())" style="display: inline-block">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock-fill" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"/>
          </svg> 
        </div>
        <input
          v-else
          type="checkbox"
          style="pointer-events:none"
          class="me-1"
          :checked="corpus.selected"
        >{{locObj(corpus.title)}}
      </label>
      <div v-if="corpus.protected && (auth.hasCredential(corpus.id.toUpperCase()))" class="me-1"" style="display:inline-block">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-unlock-fill" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M12 0a4 4 0 0 1 4 4v2.5h-1V4a3 3 0 1 0-6 0v2h.5A2.5 2.5 0 0 1 12 8.5v5A2.5 2.5 0 0 1 9.5 16h-7A2.5 2.5 0 0 1 0 13.5v-5A2.5 2.5 0 0 1 2.5 6H8V4a4 4 0 0 1 4-4"/>
        </svg>
      </div>
      <div style="display: inline" class="me-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
        </svg>
      </div>
    </div>
  </div>

</template>
