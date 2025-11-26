<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import SearchSimple from "./SearchSimple.vue"
import { storeToRefs } from "pinia"
import { vTab } from "@/bootstrap"

const store = useAppStore()

const { search_tab } = storeToRefs(store)

const tabOptions = [
  { key: 0, name: "simple" },
  { key: 1, name: "extended" },
  { key: 2, name: "advanced" },
]
</script>

<template>
  <section>
    <!-- Tab bar -->
    <nav class="nav nav-tabs" id="search-tabs-list">
      <button
        v-for="{ key, name } in tabOptions"
        :key
        class="nav-link"
        :class="{ active: search_tab == key }"
        :id="`search-tabs-tab-${name}`"
        v-tab
        :aria-controls="`search-tabs-pane-${name}`"
        :aria-selected="search_tab == key"
        @click="search_tab = key"
      >
        {{ $t(`search.${name}`) }}
      </button>
    </nav>

    <!-- Tab content -->
    <div id="search-tabs-content" class="tab-content border border-top-0 p-2 bg-body">
      <div
        class="tab-pane"
        :class="{ 'show active': search_tab == 0 }"
        id="search-tabs-pane-simple"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-simple"
        tabindex="0"
      >
        <SearchSimple />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': search_tab == 1 }"
        id="search-tabs-pane-extended"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-extended"
        tabindex="0"
      >
        TODO Extended search
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': search_tab == 2 }"
        id="search-tabs-pane-advanced"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-advanced"
        tabindex="0"
      >
        TODO Advanced search
      </div>
    </div>
  </section>
</template>
