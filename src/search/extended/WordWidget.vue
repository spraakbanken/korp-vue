<script lang="ts" setup>
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="hstack"><input type="text" v-model="model" size="10" class="form-control" /> Aa</div>
</template>
