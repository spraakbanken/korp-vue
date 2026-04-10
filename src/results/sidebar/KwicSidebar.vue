<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { computed, inject } from "vue"
import KwicSidebarAttribute from "./KwicSidebarAttribute.vue"
import { injectionKeys } from "@/injection"
import { pickBy, sortBy } from "lodash-es"
import { isKwic, isKwicRowToken } from "@/core/kwic/kwic"
import { useDynamicTabs } from "../useDynamicTabs"
import { useI18n } from "vue-i18n"
import { TextTask } from "@/core/task/TextTask"
import DependencyTree from "./DependencyTree.vue"

const { locObj } = useLocale()
const { createTab } = useDynamicTabs()
const { t } = useI18n()

const selectedToken = inject(injectionKeys.selectedToken)
const corpus = computed(() =>
  selectedToken?.value ? corpusListing.get(selectedToken.value.row.corpus) : undefined,
)

const structAttributes = computed(() => {
  if (!corpus.value) return []
  if (!selectedToken?.value || !isKwicRowToken(selectedToken?.value)) return []
  const row = selectedToken.value.row
  const attrs = Object.entries({
    ...corpus.value.struct_attributes,
    ...pickBy(corpus.value.custom_attributes, (attr) => attr.custom_type == "struct"),
  }).filter(
    ([name, attr]) => name in row.structs && attr.display_type != "hidden" && !attr.hide_sidebar,
  )
  const ordering = corpus.value?._struct_attributes_order || []
  return sortBy(attrs, ([name]) => (ordering.includes(name) ? -ordering.indexOf(name) : 0))
})

const posAttributes = computed(() => {
  if (!corpus.value) return []
  const token = selectedToken?.value?.token
  if (!token) return []
  const attrs = Object.entries({
    ...corpus.value.attributes,
    ...pickBy(corpus.value.custom_attributes, (attr) => attr.custom_type != "struct"),
  }).filter(
    ([name, attr]) => name in token.attrs && attr.display_type != "hidden" && !attr.hide_sidebar,
  )
  const ordering = corpus.value?._attributes_order || []
  return sortBy(attrs, ([name]) => (ordering.includes(name) ? -ordering.indexOf(name) : 0))
})

function openReadingMode() {
  const row = selectedToken?.value?.row
  if (row && isKwic(row)) {
    const textId = row.structs.text__id
    if (!textId) throw new Error("Selected row has no text__id")
    createTab(t("result.reader"), new TextTask(corpus.value!, textId))
  }
}
</script>

<template>
  <Transition appear>
    <aside
      v-if="selectedToken && corpus"
      class="position-absolute top-0 end-0 h-100 overflow-y-auto card"
    >
      <div class="card-body d-flex flex-column gap-3 flex-grow-0">
        <header class="d-flex gap-2 justify-content-between">
          <div>
            <div class="text-muted small text-uppercase">{{ $t("corpus") }}</div>
            <div>{{ locObj(corpus.title) }}</div>
          </div>

          <button
            type="button"
            class="btn-close"
            :aria-label="$t('close')"
            @click="selectedToken = undefined"
          />
        </header>

        <button
          v-if="corpus.reading_mode"
          type="button"
          class="btn btn-secondary"
          @click="openReadingMode()"
        >
          <fa-icon icon="fa-solid fa-book-open" />
          {{ $t("result.kwic.reading_mode.open") }}
        </button>

        <DependencyTree v-if="isKwicRowToken(selectedToken)" :tokens="selectedToken.row.tokens" />
      </div>

      <div class="accordion accordion-flush border-top border-bottom">
        <div v-if="isKwic(selectedToken.row)" class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#sidebar-accordion-struct"
              aria-expanded="true"
              aria-controls="sidebar-accordion-struct"
            >
              {{ $t("attribute_type.struct") }}
            </button>
          </h2>

          <div id="sidebar-accordion-struct" class="accordion-collapse collapse show">
            <div class="accordion-body">
              <KwicSidebarAttribute
                v-for="[name, attribute] in structAttributes"
                :key="name"
                :corpus
                :attribute
                :is-custom="'custom_type' in attribute && !!attribute.custom_type"
                :row-token="selectedToken"
                :value="selectedToken.row.structs[name]"
              />
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#sidebar-accordion-pos"
              aria-expanded="true"
              aria-controls="sidebar-accordion-pos"
            >
              {{ $t("attribute_type.pos") }}
            </button>
          </h2>

          <div id="sidebar-accordion-pos" class="accordion-collapse collapse show">
            <div class="accordion-body">
              <KwicSidebarAttribute
                v-for="[name, attribute] in posAttributes"
                :key="name"
                :corpus
                :attribute
                :is-custom="'custom_type' in attribute && !!attribute.custom_type"
                :row-token="selectedToken"
                :value="selectedToken.token.attrs[name]"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 200ms;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(100%);
}

.accordion {
  --bs-accordion-active-color: var(--bs-secondary-text-emphasis);
  --bs-accordion-active-bg: var(--bs-secondary-bg-subtle);
  --bs-accordion-btn-padding-x: var(--bs-card-spacer-x);
  --bs-accordion-body-padding-x: var(--bs-card-spacer-x);
}
</style>
