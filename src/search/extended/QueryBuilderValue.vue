<script lang="ts" setup>
import { useId } from "vue"

const model = defineModel<string>({ required: true })

const inputId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="visually-hidden">{{ $t("search.extended.value") }}</label>
    <input :id="inputId" type="text" v-model="model" class="form-control" size="10" />
  </div>
</template>
