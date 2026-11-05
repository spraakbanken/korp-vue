<script lang="ts" setup>
import { useAuth } from "../../auth/useAuth"
import LanguageSelector from "./LanguageSelector.vue"
import CorpusSelector from "@/corpora/CorpusSelector.vue"
import SearchPanel from "@/search/SearchPanel.vue"
import { injectComponent } from "@/injection"
import settings from "@/core/config"
import SearchParallel from "@/search/SearchParallel.vue"
import { computed } from "vue"
import { useLocale } from "@/i18n/useLocale"
import DarkModeToggle from "./DarkModeToggle.vue"

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
  <header class="container-fluid bg-body-tertiary pb-3">
    <div class="row mb-3 align-items-start">
      <!-- First: Branding -->
      <div class="col-sm-6 text-center text-sm-start col-xl-3 mt-3">
        <BrandPrimary />
      </div>

      <!-- Second (moved last on wide screen): Menu -->
      <div class="col-sm-6 col-xl-3 order-xl-1">
        <nav class="navbar navbar-expand-md">
          <!-- Button to toggle collapsed menu -->
          <button
            type="button"
            class="navbar-toggler ms-auto"
            data-bs-toggle="collapse"
            data-bs-target="#collapsible-navigation"
            aria-controls="collapsible-navigation"
            aria-expanded="false"
            :aria-label="$t('nav.toggle')"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Menu content, collapsed on small screen -->
          <div
            class="collapse navbar-collapse flex-wrap flex-row-reverse"
            id="collapsible-navigation"
          >
            <!-- Utility menu -->
            <div class="navbar-nav align-items-baseline">
              <!-- Login/logout -->
              <component :is="auth?.statusComponent" />

              <LanguageSelector />
              <DarkModeToggle />
              <HelpMenu />
            </div>

            <!-- Configurable links -->
            <div class="navbar-nav">
              <a
                v-for="(link, i) in links"
                :key="i"
                :href="locObj(link.url)"
                :target="link.external !== false ? '_blank' : ''"
                :title="locObj(link.title)"
                class="nav-link"
              >
                {{ locObj(link.label) }}
              </a>
            </div>

            <!-- Custom header content -->
            <div class="w-100" />
            <div class="navbar-nav">
              <BrandSecondary />
            </div>
          </div>
        </nav>
      </div>

      <!-- Third (second on wide screen): Corpus selector -->
      <CorpusSelector class="col-xl-6 pt-xl-0 mt-3" />
    </div>

    <SearchParallel v-if="isParallel" />
    <SearchPanel v-else />
  </header>
</template>
