<script setup lang="ts">
import { useConfirmDialog } from '@vueuse/core'
import { corpusListing } from '@/core/corpora/corpusListing'
import { useAppStore } from '@/store/useAppStore'
import { onMounted, ref } from 'vue'
import { partition } from 'lodash'
import { getDefaultCorpusSelection } from '@/core/config'
import type { Corpus } from '@/core/config/corpusConfig.types'

const emit = defineEmits<{
  (e: 'resolve', ids: string[]): void
}>()

const store = useAppStore()
const dialog = useConfirmDialog<string>()

const element = ref<HTMLDialogElement>()
const content = ref('')

dialog.onReveal((data) => {
  if (!data) throw new Error('Dialog revealed without data')
  content.value = data
  element.value!.showModal()
})
dialog.onCancel(() => element.value?.close())
dialog.onConfirm(() => element.value?.close())

onMounted(async () => {
  const ids = await validateCorpusSelection(store.corpus)
  emit('resolve', ids)
})

/** Interactively check that the corpus selection in the store is valid. */
async function validateCorpusSelection(ids: string[]): Promise<string[]> {
  // TODO Check if authorized:  && !auth.hasCredential(corpus.id.toUpperCase())
  const isDenied = (corpus?: Corpus) => corpus?.limited_access

  // If no id is given, use default
  if (!ids.length) {
    const defaultCorpusSelection = getDefaultCorpusSelection()
    if (defaultCorpusSelection.length) ids = defaultCorpusSelection
    else {
      // If the default setting is not given, fallback to selecting all non-protected corpora. If all are protected, select all.
      const nonhidden = corpusListing.corpora.filter((corpus) => !corpus.hide)
      const allowed = nonhidden.filter((corpus) => !isDenied(corpus))
      ids = (allowed.length ? allowed : nonhidden).map((corpus) => corpus.id)
    }
  }

  const unrecognizedIds = ids.filter(
    (id) => !corpusListing.corpora.find((corpus) => corpus.id == id),
  )
  if (unrecognizedIds.length) {
    await dialog.reveal(`Missing: ${unrecognizedIds}, removed.`)
    return validateCorpusSelection(ids.filter((id) => !unrecognizedIds.includes(id)))
  }

  const corpora = ids.map((id) => corpusListing.get(id))
  const [deniedCorpora, allowedCorpora] = partition(corpora, isDenied)
  if (deniedCorpora.length) {
    // TODO If not authenticated: show login
    if (allowedCorpora.length) {
      // Access denied for some of the corpora
      await dialog.reveal(
        `You do not have access to these selected corpora: ${deniedCorpora.map((c) => c.id)}. They will be deselected.`,
      )
      return validateCorpusSelection(allowedCorpora.map((c) => c.id))
    } else {
      // Access denied for all corpora
      // TODO What if all corpora are protected.
      await dialog.reveal(
        `You do not have access to any of the selected corpora. Default corpus selection will be used.`,
      )
      return validateCorpusSelection([])
    }
  }

  // OK
  return ids
}
</script>

<template>
  <teleport to="body">
    <dialog ref="element">
      {{ content }}
      <button @click="dialog.confirm">OK</button>
    </dialog>
  </teleport>
</template>
