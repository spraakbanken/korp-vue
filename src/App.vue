<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import config from 'config/config.yml'
</script>

<template>
  <header>
    <HelloWorld msg="Korp Vue" />
    <div v-html="config.description.eng"></div>
  </header>
</template>
