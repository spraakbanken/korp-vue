<script lang="ts" setup>
import { useAuth } from "../auth/useAuth"
import ModeSelector from "@/header/ModeSelector.vue"
import LanguageSelector from "@/header/LanguageSelector.vue"
import CorpusSelector from "@/corpora/CorpusSelector.vue"
import SearchPanel from "@/search/SearchPanel.vue"
import { injectComponent } from "@/injection"
import settings from "@/core/config"
import SearchParallel from "@/search/SearchParallel.vue"

const auth = useAuth()

const BrandPrimary = injectComponent("BrandPrimary")
const BrandSecondary = injectComponent("BrandSecondary")

/** Whether the mode is parallel */
const isParallel = !!settings["parallel"]

const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <header class="bg-body-secondary pb-3 mb-2">
    <!-- Top row -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <button
          type="button"
          class="navbar-toggler order-1"
          data-bs-toggle="collapse"
          data-bs-target="#collapsible-navigation"
          aria-controls="collapsible-navigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="collapsible-navigation">
          <ModeSelector />
        </div>

        <div class="navbar-text hstack gap-3">
          <component :is="auth?.statusComponent" />

          <LanguageSelector />

          <div class="dropdown">
            <button
              type="button"
              class="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {{ $t("gui.about") }}
            </button>

            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="https://spraakbanken.gu.se/verktyg/korp">Om Korp</a>
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="https://spraakbanken.gu.se/verktyg/korp/anvandarhandledning"
                >
                  {{ $t("gui.about.documentation") }}
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="https://spraakbanken.gu.se/korplabb/">
                  {{ $t("gui.about.lab") }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main row -->
    <section class="container-fluid">
      <div class="row mt-2 mb-3 px-2 align-items-center">
        <a :href="selfUrl" class="col-6 col-xl-3">
          <BrandPrimary />
        </a>
        <BrandSecondary class="col-6 col-xl-3 order-xl-1" />
        <CorpusSelector class="col-12 col-xl-6" />
      </div>

      <SearchParallel v-if="isParallel" />
      <SearchPanel v-else />
    </section>
  </header>
</template>
