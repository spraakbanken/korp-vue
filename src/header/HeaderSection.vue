<script lang="ts" setup>
import { useAuth } from "../auth/useAuth"
import ModeSelector from "@/header/ModeSelector.vue"
import LanguageSelector from "@/header/LanguageSelector.vue"
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

const helpLinks = computed(() => settings.navigation?.help_links || [])
const links = computed(() => settings.navigation?.links || [])

/** Whether the mode is parallel */
const isParallel = !!settings["parallel"]

const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <header class="bg-body-secondary pb-3 mb-2">
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

            <!-- Korplabb -->
            <a v-for="({ url, label }, i) in links" :key="i" :href="locObj(url)" class="nav-link">
              {{ locObj(label) }}
            </a>

            <!-- Spacer -->
            <div class="flex-grow-1" />

            <!-- Login/logout -->
            <component :is="auth?.statusComponent" />

            <LanguageSelector />

            <!-- Help menu -->
            <div v-if="helpLinks.length" class="dropdown">
              <button
                id="help-dropdown"
                type="button"
                class="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-labelledby="gui-help-label"
              >
                <fa-icon icon="fa-regular fa-circle-question" />
              </button>

              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="help-dropdown">
                <li>
                  <h6 id="gui-help-label" class="dropdown-header">{{ $t("nav.help") }}</h6>
                </li>

                <li v-for="({ url, label }, i) in helpLinks" :key="i">
                  <a
                    :href="locObj(url)"
                    target="_blank"
                    class="dropdown-item hstack justify-content-between"
                  >
                    {{ locObj(label) }}
                    <fa-icon icon="fa-solid fa-arrow-up-right-from-square" size="xs" class="ms-2" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main row -->
    <section class="container-fluid">
      <div class="row gap-2 mt-2 mb-3 px-2 align-items-center">
        <a :href="selfUrl" class="col-6 col-lg-3">
          <BrandPrimary />
        </a>
        <BrandSecondary class="col-6 col-lg-3 order-lg-1" />
        <CorpusSelector class="col-12 col-lg-6" />
      </div>

      <SearchParallel v-if="isParallel" />
      <SearchPanel v-else />
    </section>
  </header>
</template>
