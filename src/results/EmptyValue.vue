<script lang="ts" setup>
import { getEmptyValueHtml } from "./formatter"
</script>

<template>
  <span v-html="getEmptyValueHtml($t)" />
</template>
