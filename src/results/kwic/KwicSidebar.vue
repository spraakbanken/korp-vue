<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { SelectedToken } from "@/core/kwic/kwic"
import { useLocale } from "@/i18n/useLocale"
import { computed } from "vue"
import KwicSidebarAttribute from "./KwicSidebarAttribute.vue"

const { locObj } = useLocale()

const props = defineProps<{
  selectedToken: SelectedToken
}>()

const corpus = computed(() => corpusSelection.get(props.selectedToken.row.corpus))
// const textAttributes = computed(() => pick(props.selectedToken.)
</script>

<template>
  <div class="card" style="width: 30rem">
    <div class="card-body d-flex flex-column gap-3">
      <div>
        <div class="text-muted small text-uppercase">{{ $t("corpus") }}</div>
        <div>{{ locObj(corpus.title) }}</div>
      </div>

      <details v-if="'structs' in selectedToken.row" open class="border p-2">
        <summary class="bg-body-secondary p-1 -m-2 mb-1">{{ $t("attribute_type.struct") }}</summary>

        <KwicSidebarAttribute
          v-for="(attribute, name) in corpus.struct_attributes"
          :key="name"
          :corpus
          :attribute
          :value="selectedToken.row.structs[name]"
        />
      </details>

      <details open class="border p-2">
        <summary class="bg-body-secondary p-1 -m-2 mb-1">{{ $t("attribute_type.pos") }}</summary>

        <KwicSidebarAttribute
          v-for="(attribute, name) in corpus.attributes"
          :key="name"
          :corpus
          :attribute
          :value="props.selectedToken.token[name]"
        />
      </details>
    </div>
  </div>
</template>

<style scoped></style>
