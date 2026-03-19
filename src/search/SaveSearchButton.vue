<script setup lang="ts">
import { useSearchStorage } from "./useSearchStorage"
import { computed, ref, useTemplateRef, watchEffect } from "vue"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { Dropdown } from "bootstrap"
import type { CqpQuery } from "@/core/cqp/cqp.types"
import { stringify } from "@/core/cqp/cqp"
import { useReactiveFilterManager } from "./useReactiveFilterManager"

const props = defineProps<{
  query: CqpQuery | string
  suggestedLabel?: string
}>()

const { saveSearch } = useSearchStorage()
const corpusSelection = useReactiveCorpusSelection()
const filterManager = useReactiveFilterManager()

const dropdownEl = useTemplateRef("dropdown")
// TODO Prevent duplicate labels
const label = ref("")

const cqp = computed(() =>
  typeof props.query == "string"
    ? props.query
    : stringify(filterManager.mergeToCqp(props.query!), true),
)

// Update label if suggestedLabel prop changes
watchEffect(() => (label.value = props.suggestedLabel || cqp.value || label.value))

// Save and close dropdown
function save() {
  saveSearch(cqp.value, label.value, corpusSelection.getIds())
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
