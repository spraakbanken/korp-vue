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
  <header class="bg-body-tertiary pb-3">
    <!-- Top row -->
    <nav class="navbar navbar-expand-md">
      <div class="container-fluid">
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
        <div class="collapse navbar-collapse" id="collapsible-navigation">
          <div class="navbar-nav">
            <!-- Links -->
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

          <!-- Middle spacer -->
          <div class="flex-grow-1" />

          <div class="navbar-nav align-items-baseline">
            <!-- Login/logout -->
            <component :is="auth?.statusComponent" />

            <LanguageSelector />
            <DarkModeToggle />
            <HelpMenu />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main row -->
    <section class="container-fluid">
      <div class="row mb-4 align-items-center">
        <BrandPrimary class="col-sm-6 text-center text-sm-start col-xl-3 ps-4" />
        <BrandSecondary class="pt-3 text-center col-sm-6 text-sm-end pt-xl-0 col-xl-3 order-xl-1" />
        <CorpusSelector class="pt-3 col-xl-6 pt-xl-0" />
      </div>

      <SearchParallel v-if="isParallel" />
      <SearchPanel v-else />
    </section>
  </header>
</template>
