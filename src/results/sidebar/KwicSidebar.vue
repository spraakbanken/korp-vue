<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { useLocale } from "@/i18n/useLocale"
import { computed, inject } from "vue"
import KwicSidebarAttribute from "./KwicSidebarAttribute.vue"
import { injectionKeys } from "@/injection"
import { pickBy, sortBy } from "lodash-es"

const { locObj } = useLocale()

const selectedToken = inject(injectionKeys.selectedToken)
const corpus = computed(() =>
  selectedToken?.value ? corpusListing.get(selectedToken.value.row.corpus) : undefined,
)

const structAttributes = computed(() => {
  if (!corpus.value) return []
  const attrs = Object.entries({
    ...corpus.value.struct_attributes,
    ...pickBy(corpus.value.custom_attributes, (attr) => attr.custom_type == "struct"),
  }).filter(([_, attr]) => attr.display_type != "hidden" && !attr.hide_sidebar)
  const ordering = corpus.value?._struct_attributes_order || []
  return sortBy(attrs, ([name]) => (ordering.includes(name) ? -ordering.indexOf(name) : 0))
})

const posAttributes = computed(() => {
  if (!corpus.value) return []
  const attrs = Object.entries({
    ...corpus.value.attributes,
    ...pickBy(corpus.value.custom_attributes, (attr) => attr.custom_type != "struct"),
  }).filter(([_, attr]) => attr.display_type != "hidden" && !attr.hide_sidebar)
  const ordering = corpus.value?._attributes_order || []
  return sortBy(attrs, ([name]) => (ordering.includes(name) ? -ordering.indexOf(name) : 0))
})
</script>

<script lang="ts">
export const SIDEBAR_WIDTH_REM = 20
</script>

<template>
  <Transition appear>
    <aside
      v-if="selectedToken && corpus"
      class="position-absolute top-0 end-0 h-100 overflow-y-auto card shadow"
      :style="{ width: `${SIDEBAR_WIDTH_REM}rem` }"
    >
      <div class="card-body d-flex flex-column gap-3">
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

        <details v-if="'structs' in selectedToken.row" open class="bg-body-tertiary rounded">
          <summary class="bg-body-tertiary p-1">{{ $t("attribute_type.struct") }}</summary>

          <div class="p-2">
            <KwicSidebarAttribute
              v-for="[name, attribute] in structAttributes"
              :key="name"
              :corpus
              :attribute
              :is-custom="'custom_type' in attribute && !!attribute.custom_type"
              :row="selectedToken.row"
              :token="selectedToken.token"
              :value="selectedToken.row.structs[name]"
            />
          </div>
        </details>

        <details open class="bg-body-tertiary rounded">
          <summary class="bg-body-tertiary p-1">{{ $t("attribute_type.pos") }}</summary>

          <div class="p-2">
            <KwicSidebarAttribute
              v-for="[name, attribute] in posAttributes"
              :key="name"
              :corpus
              :attribute
              :is-custom="'custom_type' in attribute && !!attribute.custom_type"
              :row="selectedToken.row"
              :token="selectedToken.token"
              :value="selectedToken.token[name]"
            />
          </div>
        </details>
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
</style>
