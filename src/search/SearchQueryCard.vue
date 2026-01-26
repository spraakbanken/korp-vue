<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { computed } from "vue"

const props = defineProps<{
  cqp: string
  corpusIds: string[]
}>()

const { locObj } = useLocale()

const corpora = computed(() => props.corpusIds.map((id) => corpusListing.get(id)))
const corpusNames = computed(() => corpora.value.map((corpus) => locObj(corpus.title)).join(", "))
</script>

<template>
  <div class="card p-2 bg-body-tertiary text-muted">
    <div>
      <strong>{{ $t("search.storage.cqp") }}: </strong>
      <code>{{ cqp }}</code>
    </div>
    <div>
      <strong>{{ $t("search.storage.corpora") }}: </strong>
      <template v-if="corpora.length <= 3">
        {{ corpusNames }}
      </template>
      <abbr v-else :title="corpusNames">
        {{ $t("search.storage.corpora_count", [corpora.length]) }}
      </abbr>
    </div>
  </div>
</template>
