<script setup lang="ts">
import settings from '@instance/settings'
import ExtendedSearchCondition from '@/components/search/ExtendedSearchCondition.vue'
</script>

<template>
  <h1>Korp-vue</h1>
  <p>{{ $t('tagline') }}</p>
  <header>
    Mode: <a href=".">default</a>, <a href="?mode=kubhist">kubhist</a> Språk:
    <a href="?lang=sv">sv</a>, <a href="?lang=en">en</a>, <a href="?lang=de">de (instance)</a>
  </header>

  <main>
    <h2>Settings</h2>
    <pre>{{ settings.description.eng }}</pre>

    <h2>Custom components</h2>
    <ExtendedSearchCondition />
  </main>
</template>
