<script lang="ts" setup>
import { useAuth } from "../auth/useAuth"
import ModeSelector from "@/header/ModeSelector.vue"
import LanguageSelector from "@/header/LanguageSelector.vue"
import CorpusSelector from "@/corpora/CorpusSelector.vue"
import SearchPanel from "@/search/SearchPanel.vue"

const auth = useAuth()
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
      <div class="row my-2">
        <div class="col-3"></div>
        <CorpusSelector class="col-6" />
        <div class="col-3"></div>
      </div>

      <SearchPanel class="my-2" />
    </section>
  </header>
</template>
