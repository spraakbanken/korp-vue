<script lang="ts" setup>
import { useAuth } from "../auth/useAuth"
import ModeSelector from "@/header/ModeSelector.vue"
import LanguageSelector from "@/header/LanguageSelector.vue"
import CorpusSelector from "@/corpora/CorpusSelector.vue"
import SearchPanel from "@/search/SearchPanel.vue"
import { injectComponent } from "@/injection"

const auth = useAuth()

const BrandPrimary = injectComponent("BrandPrimary")
const BrandSecondary = injectComponent("BrandSecondary")

const selfUrl = window.location.href.replace(/#.*/, "")
</script>

<template>
  <header class="bg-body-secondary pb-3 mb-2">
    <nav class="navbar navbar-expand">
      <div class="container-fluid">
        <ModeSelector />

        <LanguageSelector />

        <component :is="auth?.statusComponent" />
      </div>
    </nav>

    <section class="container-fluid">
      <div class="row my-2 px-2 align-items-center">
        <a :href="selfUrl" class="col-6 col-xl-3">
          <BrandPrimary />
        </a>
        <BrandSecondary class="col-6 col-xl-3 order-xl-1" />
        <CorpusSelector class="col-12 col-xl-6 mt-2" />
      </div>

      <SearchPanel />
    </section>
  </header>
</template>
