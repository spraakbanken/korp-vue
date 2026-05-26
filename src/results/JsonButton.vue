<script lang="ts" setup>
import { downloadFile } from "@/core/util"
import { useMatomo } from "vue3-matomo"

const props = defineProps<{
  data?: object
  endpoint: string
}>()

const matomo = useMatomo()

function download() {
  const json = JSON.stringify(props.data, null, 2)
  const endpoint = props.endpoint || "response"
  downloadFile(json, `korp-${endpoint}.json`, "application/json")
  matomo.value?.trackEvent("Result", "Download JSON", endpoint)
}
</script>

<template>
  <button type="button" class="btn btn-secondary" @click="download()" :disabled="!props.data">
    <fa-icon icon="fa-solid fa-download" />
    {{ $t("result.export.json") }}
  </button>
</template>
