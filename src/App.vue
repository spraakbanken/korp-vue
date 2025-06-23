<script setup lang="ts">
import ExtendedSearchCondition from '@/components/search/extended/ExtendedSearchCondition.vue'
import SearchSection from './components/search/SearchSection.vue'
import CorpusSelector from './components/CorpusSelector.vue'
import { useInit } from './useInit'
import { ref } from 'vue'
import { whenever } from '@vueuse/core'
import ModeSelector from './components/ModeSelector.vue'

const { initialize, settings } = useInit()

const corpusSelection = ref<string[]>([])

initialize()

whenever(settings, (settings) => {
  corpusSelection.value = settings.preselected_corpora || []
})
</script>

<template>
  <header class="container mb-2">
    <div class="flex justify-between text-sm py-1">
      <ModeSelector />
    </div>

    <div class="flex justify-between">
      (Korp logo)
      <CorpusSelector
        v-if="settings"
        :items="Object.values(settings.corpora)"
        v-model="corpusSelection"
      ></CorpusSelector>
    </div>
  </header>

  <SearchSection class="container"></SearchSection>

  <section>
    <h2>Settings</h2>
    <p>The kubhist and mink modes modify the default value.</p>
    <pre>korp_backend_url: {{ settings?.korp_backend_url }}</pre>
  </section>

  <section>
    <h2>Custom components</h2>
    <p>
      This models what would show in the Extended search query builder for a given attribute. The
      <code>word</code> and <code>autocExtended</code> widgets are in core, and the one for
      <code>msd</code> is added by the instance.
    </p>
    <ExtendedSearchCondition />
    <p>
      This structure can also be used for other components and functions that are named in config:
      sidebar component, stringifier, cqp stringifier, reading mode component, auth module.
    </p>
  </section>

  <section>
    <h2>I18n</h2>
    <p>The Deutsch locale is added by the instance.</p>
    <button
      v-for="{ value, label } in settings?.languages"
      :key="value"
      :disabled="value == $i18n.locale"
      @click="$i18n.locale = value"
    >
      {{ label }}
    </button>
    <p>{{ $i18n.locale }} {{ $t('tagline') }}</p>
    <p>{{ settings?.description[$i18n.locale] }}</p>
  </section>
</template>
