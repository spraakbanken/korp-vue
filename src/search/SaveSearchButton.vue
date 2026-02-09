<script setup lang="ts">
import { useSearchStorage } from "./useSearchStorage"
import { ref, useTemplateRef, watchEffect } from "vue"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { Dropdown } from "bootstrap"

const props = defineProps<{
  cqp: string
  suggestedLabel?: string
}>()

const { saveSearch } = useSearchStorage()
const corpusSelection = useReactiveCorpusSelection()

const dropdownEl = useTemplateRef("dropdown")
// TODO Prevent duplicate labels
const label = ref("")

// Update label if suggestedLabel prop changes
watchEffect(() => (label.value = props.suggestedLabel || label.value))

// Save and close dropdown
function save() {
  saveSearch(props.cqp, label.value, corpusSelection.getIds())
  Dropdown.getOrCreateInstance(dropdownEl.value!).hide()
}
</script>

<template>
  <button
    type="button"
    ref="dropdown"
    class="btn btn-outline-primary dropdown-toggle"
    data-bs-toggle="dropdown"
    data-bs-auto-close="outside"
    aria-expanded="false"
  >
    {{ $t("save") }}
  </button>

  <div class="dropdown-menu p-2" style="width: 20em">
    <form @submit.prevent="save()">
      <p class="text-muted">{{ $t("search.save.help") }}</p>
      <div class="form-label">
        {{ $t("search.save.save_as") }}
      </div>
      <div class="hstack gap-2 align-items-baseline">
        <input type="text" v-model="label" class="form-control" />
        <input type="submit" class="btn btn-primary" :value="$t('save')" />
      </div>
    </form>
  </div>
</template>
