<script lang="ts" setup>
import { downloadFile } from "@/core/util"

const props = defineProps<{
  data?: object
  endpoint: string
}>()

function download() {
  const json = JSON.stringify(props.data, null, 2)
  downloadFile(json, `korp-${props.endpoint}.json`, "application/json")
}
</script>

<template>
  <button type="button" class="btn btn-secondary" @click="download()" :disabled="!props.data">
    <fa-icon icon="fa-solid fa-download" />
    {{ $t("result.json") }}
  </button>
</template>
