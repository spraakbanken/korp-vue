<script setup lang="ts">
import { useAppStore } from "@/store/useAppStore"
import SearchSimple from "./SearchSimple.vue"
import { storeToRefs } from "pinia"
import { vTab } from "@/bootstrap"
import SearchExtended from "./extended/SearchExtended.vue"
import settings from "@/core/config"
import SearchAdvanced from "./SearchAdvanced.vue"

const store = useAppStore()

const { search_tab } = storeToRefs(store)

const tabOptions = settings.parallel ? ["extended"] : ["simple", "extended", "advanced"]
</script>

<template>
  <section class="d-flex flex-column align-items-center">
    <!-- Tab bar -->
    <nav
      v-show="tabOptions.length > 1"
      class="nav nav-tabs justify-content-center"
      id="search-tabs-list"
    >
      <button
        v-for="(name, key) in tabOptions"
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
    <div
      id="search-tabs-content"
      class="tab-content border p-4 bg-body"
      :class="{ 'border-top-0': tabOptions.length > 1 }"
    >
      <div
        class="tab-pane"
        :class="{ 'show active': search_tab == tabOptions.indexOf('simple') }"
        id="search-tabs-pane-simple"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-simple"
        tabindex="0"
      >
        <SearchSimple />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': search_tab == tabOptions.indexOf('extended') }"
        id="search-tabs-pane-extended"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-extended"
        tabindex="0"
      >
        <SearchExtended />
      </div>

      <div
        class="tab-pane"
        :class="{ 'show active': search_tab == tabOptions.indexOf('advanced') }"
        id="search-tabs-pane-advanced"
        role="tabpanel"
        aria-labelledby="search-tabs-tab-advanced"
        tabindex="0"
      >
        <SearchAdvanced />
      </div>
    </div>
  </section>
</template>
