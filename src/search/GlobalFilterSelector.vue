<script setup lang="ts">
import type { LangString } from "@/core/model/locale"
import { useLocale } from "@/i18n/useLocale"
import EmptyValue from "@/results/EmptyValue.vue"
import { useAppStore } from "@/store/useAppStore"
import { capitalize, sortBy } from "lodash-es"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

const model = defineModel<string[]>({ default: [] })

const props = defineProps<{
  label: LangString
  options: [string, number][]
}>()

const { locale } = useI18n()
const { locObj } = useLocale()
const store = useAppStore()
// Store WIP selection locally until menu is closed
const selectionLocal = ref<string[]>(model.value)

// Sort options by name, then by hits (any or none), then by selection
const optionsSorted = computed(() =>
  sortBy(
    [...props.options].sort((a, b) => a[0].localeCompare(b[0], store.lang)),
    (option) => option[1] == 0,
    (option) => !model.value.includes(option[0]),
  ),
)

const selectionSummary = computed(() =>
  selectionLocal.value.map((value) => value || "—").join(", "),
)

// Select or deselect value
function toggle(value: string) {
  if (selectionLocal.value.includes(value)) {
    selectionLocal.value = selectionLocal.value.filter((v) => v != value)
  } else {
    selectionLocal.value = [...selectionLocal.value, value]
    selectionLocal.value.sort((a, b) => a.localeCompare(b, locale.value))
  }
}

// Sync local selection when model changes from outside
watch(model, () => (selectionLocal.value = model.value))
</script>

<template>
  <div
    class="dropdown"
    v-on="{
      // Commit selection when dropdown is closed
      'hidden.bs.dropdown': () => (model = selectionLocal),
    }"
  >
    <button
      class="form-control dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-expanded="false"
    >
      <span
        class="d-inline-block align-bottom overflow-hidden text-truncate"
        style="max-width: 15em"
      >
        <template v-if="selectionLocal.length">
          {{ capitalize(locObj(label)) }}:
          {{ selectionSummary }}
        </template>
        <template v-else>
          {{ $t("search.filters.add", [locObj(label)]) }}
        </template>
      </span>
    </button>

    <ul class="dropdown-menu">
      <li v-for="[value, hits] in optionsSorted" :key="value">
        <a
          class="dropdown-item d-flex justify-content-between align-items-baseline gap-2"
          href="#"
          @click.prevent="toggle(value)"
          :class="{
            active: selectionLocal.includes(value),
            disabled: !selectionLocal.includes(value) && !hits,
          }"
        >
          <template v-if="value">{{ value }}</template>
          <EmptyValue v-else />
          <span class="badge text-secondary-inactive">
            {{ $n(hits) }}
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>
