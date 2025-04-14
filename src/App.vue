<script setup lang="ts">
import config from 'config/config.yml'
import ExtendedSearchCondition from './components/ExtendedSearch/ExtendedSearchCondition.vue'
</script>

<template>
  <header>
    <div v-html="config.description.eng"></div>
    <hr />
    <ExtendedSearchCondition />
  </header>
</template>
