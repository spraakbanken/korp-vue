<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { onMounted, ref } from "vue"
import { partition } from "lodash-es"
import { getDefaultCorpusSelection } from "@/core/config"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { useAuth } from "@/auth/useAuth"
import ModalDialog, { type ConfirmDialog } from "@/components/ModalDialog.vue"

const emit = defineEmits<{
  (e: "resolve", ids: string[]): void
}>()

const store = useAppStore()
const auth = useAuth()

const message = ref("")
let dialog: ConfirmDialog | undefined

onMounted(async () => {
  const ids = await validateCorpusSelection(store.corpus)
  emit("resolve", ids)
})

/** Interactively check that the corpus selection in the store is valid. */
async function validateCorpusSelection(ids: string[], skipLogin = false): Promise<string[]> {
  const isDenied = (corpus?: Corpus) =>
    corpus?.limited_access && !auth.hasCredential(corpus.id.toUpperCase())

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
    await showDialog(`Missing: ${unrecognizedIds}, removed.`)
    return validateCorpusSelection(ids.filter((id) => !unrecognizedIds.includes(id)))
  }

  const corpora = ids.map((id) => corpusListing.get(id))
  const [deniedCorpora, allowedCorpora] = partition(corpora, isDenied)
  if (deniedCorpora.length) {
    if (auth.isLoggedIn() || skipLogin) {
      if (allowedCorpora.length) {
        // Access denied for some of the corpora
        await showDialog(
          `You do not have access to these selected corpora: ${deniedCorpora.map((c) => c.id)}. They will be deselected.`,
        )
        return validateCorpusSelection(allowedCorpora.map((c) => c.id))
      } else {
        // Access denied for all corpora
        // TODO What if all corpora are protected.
        await showDialog(
          `You do not have access to any of the selected corpora. Default corpus selection will be used.`,
        )
        return validateCorpusSelection([])
      }
    } else {
      await showDialog(
        `You do not have access to these selected corpora: ${deniedCorpora.map((c) => c.id)}. Log in to continue.`,
      )
      await auth.attemptLogin()
      // Check again but don't ask for login again if user dismissed it.
      return validateCorpusSelection(ids, true)
    }
  }

  // OK
  return ids
}

async function showDialog(messageNew: string) {
  message.value = messageNew
  return await dialog?.reveal()
}
</script>

<template>
  <ModalDialog :title="$t('corpus.selection.validation.dialog.title')" @setup="dialog = $event">
    {{ message }}
  </ModalDialog>
</template>
