<script setup lang="ts">
import settings from '@instance/settings'
import ExtendedSearchCondition from '@/components/search/ExtendedSearchCondition.vue'
</script>

<template>
  <header>Mode: <a href=".">default</a>, <a href="?mode=kubhist">kubhist</a></header>

  <main>
    <h2>Settings</h2>
    <pre>{{ settings.description.eng }}</pre>

    <h2>Custom components</h2>
    <ExtendedSearchCondition />
  </main>
</template>
