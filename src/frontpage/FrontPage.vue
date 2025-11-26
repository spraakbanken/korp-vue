<script lang="ts" setup>
import settings from "@/core/config"
import SearchExamples from "./SearchExamples.vue"
import { useLocale } from "@/i18n/useLocale"
import CorpusUpdates from "./CorpusUpdates.vue"
import NewsDesk from "./NewsDesk.vue"

const { locObj } = useLocale()

const examples = settings.frontpage?.examples
</script>

<template>
  <div class="container">
    <div class="row">
      <div v-if="settings.description || settings.mode_description" class="col-md mb-4">
        <div v-if="settings.description" v-html="locObj(settings.description)"></div>

        <div v-if="settings.mode_description">
          <h3>{{ locObj(settings.mode.label) }}</h3>
          <div v-html="locObj(settings.mode_description)"></div>
        </div>
      </div>

      <SearchExamples class="col-md mb-4" v-if="examples" :items="examples" />
    </div>

    <div class="row">
      <CorpusUpdates v-if="settings.frontpage?.corpus_updates" class="col-md mb-4" />
      <NewsDesk v-if="settings.news_url" class="col-md mb-4" />
    </div>
  </div>
</template>
