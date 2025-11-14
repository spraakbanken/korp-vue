<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import SearchSimple from "./SearchSimple.vue"
import { storeToRefs } from "pinia"
import { vTab } from "@/bootstrap"

const store = useAppStore()

const { searchTab } = storeToRefs(store)

const tabOptions = [
  { key: 1, name: "simple" },
  { key: 2, name: "extended" },
  { key: 3, name: "advanced" },
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
        :class="{ active: searchTab == key }"
        :id="`search-tabs-tab-${name}`"
        v-tab
        :aria-controls="`search-tabs-pane-${name}`"
        :aria-selected="searchTab == key"
        @click="searchTab = key"
      >
        {{ $t(`search.${name}`) }}
      </button>
    </nav>

    <!-- Tab content -->
    <div class="tab-content border border-top-0 p-2" id="search-tabs-content">
      <div
        class="tab-pane"
        :class="{ 'show active': searchTab == 1 }"
        id="search-tabs-pane-simple"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-simple"
        tabindex="0"
      >
        <SearchSimple />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': searchTab == 2 }"
        id="search-tabs-pane-extended"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-extended"
        tabindex="0"
      >
        TODO Extended search
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': searchTab == 3 }"
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
