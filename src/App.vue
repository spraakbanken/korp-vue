<script setup lang="ts">
import settings from '@instance/settings'
import ExtendedSearchCondition from '@/components/search/ExtendedSearchCondition.vue'
</script>

<template>
  <h1>Korp-vue</h1>
  <header>
    Mode: <a href=".">default</a>, <a href="?mode=kubhist">kubhist</a> (has a mode plugin),
    <a href="?mode=segreg">segreg</a> (has no custom stuff)
  </header>

  <section>
    <h2>Settings</h2>
    <p>The kubhist mode code modifies the default value.</p>
    <pre>korp_backend_url: {{ settings.korp_backend_url }}</pre>
  </section>

  <section>
    <h2>Custom components</h2>
    <p>
      This models what would show in the Extended search query builder for a given attribute. The
      widget for <code>word</code> is in core, and the one for <code>msd</code> is added by the
      instance.
    </p>
    <ExtendedSearchCondition />
  </section>

  <section>
    <h2>I18n</h2>
    <p>The Deutsch locale is added by the instance.</p>
    <button
      v-for="{ value, label } in settings.languages"
      :key="value"
      @click="$i18n.locale = value"
    >
      {{ label }}
    </button>
    <p>{{ $i18n.locale }} {{ $t('tagline') }}</p>
  </section>
</template>
