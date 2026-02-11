<script setup lang="ts">
import type { LangString } from "@/core/model/locale"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { capitalize, sortBy } from "lodash-es"
import { computed, ref, watch } from "vue"

const model = defineModel<string[]>({ default: [] })

const props = defineProps<{
  label: LangString
  options: [string, number][]
}>()

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

// Select or deselect value
function toggle(value: string) {
  if (selectionLocal.value.includes(value)) {
    selectionLocal.value = selectionLocal.value.filter((v) => v != value)
  } else {
    selectionLocal.value = [...selectionLocal.value, value]
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
      class="btn dropdown-toggle align-baseline"
      type="button"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-expanded="false"
      :class="model.length ? 'btn-secondary' : 'btn-outline-secondary'"
    >
      <span
        class="d-inline-block align-bottom overflow-hidden text-truncate"
        style="max-width: 15em"
      >
        <template v-if="selectionLocal.length">
          {{ capitalize(locObj(label)) }}:
          {{ selectionLocal.join(", ") }}
        </template>
        <template v-else>
          {{ $t("search.filters.add", [locObj(label)]) }}
        </template>
      </span>
    </button>

    <ul class="dropdown-menu">
      <li v-for="[value, hits] in optionsSorted" :key="value">
        <a
          class="dropdown-item"
          href="#"
          @click.prevent="toggle(value)"
          :class="{ active: selectionLocal.includes(value), disabled: !hits }"
        >
          {{ value }} ({{ hits }})
        </a>
      </li>
    </ul>
  </div>
</template>
