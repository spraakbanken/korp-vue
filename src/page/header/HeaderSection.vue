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
    <nav class="navbar navbar-expand-md">
      <div class="container-fluid">
        <!-- Button to toggle collapsed menu -->
        <button
          type="button"
          class="navbar-toggler order-1 ms-auto"
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
          <div class="row flex-grow-1">
            <div class="col-md-4">
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
            </div>

            <div class="col-md-4">
              <div class="navbar-nav justify-content-center">
                <ModeSelector />
              </div>
            </div>

            <div class="col-md-4">
              <div class="navbar-nav justify-content-end">
                <!-- Login/logout -->
                <component :is="auth?.statusComponent" />

                <LanguageSelector />

                <HelpMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main row -->
    <section class="container-fluid">
      <div class="row mb-3 align-items-center">
        <BrandPrimary class="col-sm-6 text-center text-sm-start col-lg-3 ps-4" />
        <BrandSecondary class="pt-3 text-center col-sm-6 text-sm-end pt-lg-0 col-lg-3 order-lg-1" />
        <CorpusSelector class="pt-3 col-lg-6 pt-lg-0" />
      </div>

      <SearchParallel v-if="isParallel" />
      <SearchPanel v-else />
    </section>
  </header>
</template>
