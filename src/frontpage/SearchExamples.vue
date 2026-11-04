<script setup lang="ts">
import type { SearchExample } from "@/core/config/instanceConfig.types"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { shuffle } from "lodash-es"
import { useMatomo } from "vue3-matomo"

const props = defineProps<{
  items: SearchExample[]
}>()

const store = useAppStore()
const { locObj } = useLocale()
const matomo = useMatomo()

// Pick 3 random examples
const examples = shuffle(props.items).slice(0, 3)

/** Apply selected search example to app state */
function select(example: SearchExample) {
  matomo.value?.trackEvent("Search", "Select example", locObj(example.label))
  store.$patch(example.params)
}
</script>

<template>
  <section>
    <h4>{{ $t("frontpage.examples") }}</h4>
    <ul class="list-unstyled vstack gap-2">
      <li v-for="(example, index) in examples" :key="index" class="card">
        <div class="card-body hstack justify-content-between gap-4">
          <div>
            <h5 class="fs-6 m-0">{{ locObj(example.label) }}</h5>
            <div v-if="example.hint" v-html="locObj(example.hint)" class="mt-1" />
          </div>
          <button type="button" class="btn btn-sm btn-secondary" @click.prevent="select(example)">
            {{ $t("search") }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
