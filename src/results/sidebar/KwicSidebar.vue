<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { computed, inject } from "vue"
import KwicSidebarAttribute from "./KwicSidebarAttribute.vue"
import { injectionKeys } from "@/injection"
import { sortBy } from "lodash-es"
import { isKwic, isKwicRowToken } from "@/core/kwic/kwic"
import { useDynamicTabs } from "../useDynamicTabs"
import { useI18n } from "vue-i18n"
import { TextTask } from "@/core/task/TextTask"
import DeptreeDiagram from "./DeptreeDiagram.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import type { Attribute } from "@/core/config/corpusConfigRaw.types"

const { locObj } = useLocale()
const { createTab } = useDynamicTabs()
const { t } = useI18n()

const selectedToken = inject(injectionKeys.selectedToken)
const corpus = computed(() =>
  selectedToken?.value ? corpusListing.get(selectedToken.value.row.corpus) : undefined,
)

const structAttributes = computed(() => {
  if (!selectedToken?.value || !isKwicRowToken(selectedToken?.value)) return []
  const row = selectedToken.value.row
  return identifyAttributes("struct_attributes", (attr) => attr.name in row.structs, "struct")
})

const posAttributes = computed(() => {
  const token = selectedToken?.value?.token
  if (!token) return []
  return identifyAttributes("attributes", (attr) => attr.name in token.attrs, "pos")
})

/** Find which attributes to show */
function identifyAttributes(
  corpusKey: "attributes" | "struct_attributes",
  filter: (attr: Attribute) => boolean,
  customType: "struct" | "pos",
): Attribute[] {
  if (!corpus.value) return []
  const baseAttrs = Object.values(corpus.value[corpusKey]).filter(filter)
  const customAttrs = Object.values(corpus.value.custom_attributes || {}).filter(
    (attr) => attr.custom_type == customType,
  )
  const attrs = [...baseAttrs, ...customAttrs].filter(
    (attr) => attr.display_type != "hidden" && !attr.hide_sidebar,
  )
  // Sort according to order in config
  const ordering = corpus.value._attributes_order || []
  return sortBy(attrs, (attr) => (ordering.includes(attr.name) ? -ordering.indexOf(attr.name) : 0))
}

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

        <template v-if="!corpus.deptree?.hidden && isKwicRowToken(selectedToken)">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-toggle="modal"
            data-bs-target="#deptree-modal"
          >
            <fa-icon icon="fa-solid fa-sitemap" />
            {{ $t("result.kwic.deptree.open") }}
          </button>
          <ModalDialog id="deptree-modal" :title="$t('result.kwic.deptree')" size="xl">
            <!-- TODO Wrong selected token in subsearch -->
            <DeptreeDiagram :corpus :tokens="selectedToken.row.tokens" />
          </ModalDialog>
        </template>
      </div>

      <div class="accordion accordion-flush border-top border-bottom">
        <div v-if="isKwic(selectedToken.row) && structAttributes.length" class="accordion-item">
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
                v-for="attr in structAttributes"
                :key="attr.name"
                :corpus
                :attribute="attr"
                :is-custom="'custom_type' in attr && !!attr.custom_type"
                :row-token="selectedToken"
                :value="selectedToken.row.structs[attr.name]"
              />
            </div>
          </div>
        </div>

        <div v-if="posAttributes.length" class="accordion-item">
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
                v-for="attr in posAttributes"
                :key="attr.name"
                :corpus
                :attribute="attr"
                :is-custom="'custom_type' in attr && !!attr.custom_type"
                :row-token="selectedToken"
                :value="selectedToken.token.attrs[attr.name]"
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
  --bs-accordion-active-color: var(--bs-body-color);
  --bs-accordion-active-bg: var(--bs-tertiary-bg);
  --bs-accordion-btn-padding-x: var(--bs-card-spacer-x);
  --bs-accordion-body-padding-x: var(--bs-card-spacer-x);
}
</style>
