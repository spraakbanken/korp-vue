<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import SearchSimple from "./SearchSimple.vue"
import { storeToRefs } from "pinia"

const store = useAppStore()

const { searchTab } = storeToRefs(store)
</script>

<template>
  <section>
    <!-- Tab bar -->
    <nav class="nav nav-tabs" id="search-tabs-list">
      <button
        class="nav-link"
        :class="{ active: searchTab == 1 }"
        id="search-tabs-tab-simple"
        data-bs-toggle="tab"
        data-bs-target="#search-tabs-pane-simple"
        type="button"
        role="tab"
        aria-controls="search-tabs-pane-simple"
        :aria-selected="searchTab == 1"
      >
        {{ $t("search.simple") }}
      </button>
      <button
        class="nav-link"
        :class="{ active: searchTab == 2 }"
        id="search-tabs-tab-extended"
        data-bs-toggle="tab"
        data-bs-target="#search-tabs-pane-extended"
        type="button"
        role="tab"
        aria-controls="search-tabs-pane-extended"
        :aria-selected="searchTab == 2"
      >
        {{ $t("search.extended") }}
      </button>
      <button
        class="nav-link"
        :class="{ active: searchTab == 3 }"
        id="search-tabs-tab-advanced"
        data-bs-toggle="tab"
        data-bs-target="#search-tabs-pane-advanced"
        type="button"
        role="tab"
        aria-controls="search-tabs-pane-advanced"
        :aria-selected="searchTab == 3"
      >
        {{ $t("search.advanced") }}
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
