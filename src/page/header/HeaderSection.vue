<script lang="ts" setup>
import { useAuth } from "../../auth/useAuth"
import ModeSelector from "./ModeSelector.vue"
import LanguageSelector from "./LanguageSelector.vue"
import CorpusSelector from "@/corpora/CorpusSelector.vue"
import SearchPanel from "@/search/SearchPanel.vue"
import { injectComponent } from "@/injection"
import settings from "@/core/config"
import SearchParallel from "@/search/SearchParallel.vue"
import { computed } from "vue"
import { useLocale } from "@/i18n/useLocale"

const auth = useAuth()
const { locObj } = useLocale()

const BrandPrimary = injectComponent("BrandPrimary")
const BrandSecondary = injectComponent("BrandSecondary")
const HelpMenu = injectComponent("HelpMenu")

const links = computed(() => settings.navigation?.links || [])

/** Whether the mode is parallel */
const isParallel = !!settings["parallel"]
</script>

<template>
  <header class="bg-body-tertiary pb-3 mb-2">
    <!-- Top row -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <!-- Button to toggle collapsed menu -->
        <button
          type="button"
          class="navbar-toggler order-1"
          data-bs-toggle="collapse"
          data-bs-target="#collapsible-navigation"
          aria-controls="collapsible-navigation"
          aria-expanded="false"
          :aria-label="$t('nav.toggle')"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Menu content, collapsed on small screen -->
        <div class="collapse navbar-collapse" id="collapsible-navigation">
          <div class="navbar-nav flex-grow-1">
            <ModeSelector class="me-auto" />

            <!-- Links -->
            <a v-for="({ url, label }, i) in links" :key="i" :href="locObj(url)" class="nav-link">
              {{ locObj(label) }}
            </a>

            <!-- Spacer -->
            <div class="flex-grow-1" />

            <!-- Login/logout -->
            <component :is="auth?.statusComponent" />

            <LanguageSelector />

            <HelpMenu />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main row -->
    <section class="container-fluid">
      <div class="row mt-2 mb-3 px-2 align-items-center">
        <BrandPrimary class="col-6 col-lg-4" />
        <BrandSecondary class="col-6 col-lg-4 order-lg-1 text-end" />
        <CorpusSelector class="col-12 col-lg-4" />
      </div>

      <SearchParallel v-if="isParallel" />
      <SearchPanel v-else />
    </section>
  </header>
</template>
