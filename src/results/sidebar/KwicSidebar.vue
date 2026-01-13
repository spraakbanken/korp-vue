<script setup lang="ts">
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { computed, inject } from "vue"
import KwicSidebarAttribute from "./KwicSidebarAttribute.vue"
import { injectionKeys } from "@/injection"

const { locObj } = useLocale()

const selectedToken = inject(injectionKeys.selectedToken)
const corpus = computed(() =>
  selectedToken?.value ? corpusSelection.get(selectedToken.value.row.corpus) : undefined,
)
</script>

<template>
  <div v-if="selectedToken && corpus" class="card" style="width: 30rem">
    <div class="card-body d-flex flex-column gap-3">
      <div>
        <div class="text-muted small text-uppercase">{{ $t("corpus") }}</div>
        <div>{{ locObj(corpus.title) }}</div>
      </div>

      <details v-if="'structs' in selectedToken.row" open class="border">
        <summary class="bg-body-secondary p-1">{{ $t("attribute_type.struct") }}</summary>

        <div class="p-2">
        <KwicSidebarAttribute
          v-for="(attribute, name) in corpus.struct_attributes"
          :key="name"
          :corpus
          :attribute
          :value="selectedToken.row.structs[name]"
        />
        </div>
      </details>

      <details open class="border">
        <summary class="bg-body-secondary p-1">{{ $t("attribute_type.pos") }}</summary>

        <div class="p-2">
        <KwicSidebarAttribute
          v-for="(attribute, name) in corpus.attributes"
          :key="name"
          :corpus
          :attribute
          :value="selectedToken.token[name]"
        />
        </div>
      </details>
    </div>
  </div>
</template>
