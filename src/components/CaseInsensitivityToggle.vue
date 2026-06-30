<script setup lang="ts">
import { useId } from "vue"

const id = useId()
const model = defineModel<boolean>()
</script>

<template>
  <span>
    <input type="checkbox" :id autocomplete="off" v-model="model" class="btn-check" />
    <label class="btn btn-sm fw-normal" :for="id">
      <abbr :title="$t('search.ignore_case')">Aa</abbr>
    </label>
  </span>
</template>
