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
        </div>
      </div>
    </nav>

    <!-- Main row -->
    <section class="container-fluid">
      <div class="row my-2 px-2 align-items-center">
        <a :href="selfUrl" class="col-6 col-xl-3">
          <BrandPrimary />
        </a>
        <BrandSecondary class="col-6 col-xl-3 order-xl-1" />
        <CorpusSelector class="col-12 col-xl-6 mt-2" />
      </div>

      <SearchParallel v-if="isParallel" />
      <SearchPanel v-else />
    </section>
  </header>
</template>
