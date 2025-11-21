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
</script>

<template>
  <header>
    <nav class="navbar navbar-expand">
      <div class="container">
        <ModeSelector />

        <LanguageSelector />

        <component :is="auth?.statusComponent" />
      </div>
    </nav>

    <section class="container">
      <div class="row my-2 align-items-center">
        <BrandPrimary class="col-6 col-xl-3" />
        <BrandSecondary class="col-6 col-xl-3 order-xl-1" />
        <CorpusSelector class="col-12 col-xl-6 mt-2" />
      </div>

      <SearchPanel class="my-4" />
    </section>
  </header>
</template>
