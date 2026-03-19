<script setup lang="ts">
import type { SearchExample } from "@/core/config/instanceConfig.types"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { shuffle } from "lodash-es"

const props = defineProps<{
  items: SearchExample[]
}>()

const store = useAppStore()
const { locObj } = useLocale()

// Pick 3 random examples
const examples = shuffle(props.items).slice(0, 3)

/** Apply selected search example to app state */
function select(example: SearchExample) {
  store.$patch(example.params)
}
</script>

<template>
  <section>
    <h4>{{ $t("frontpage.examples") }}</h4>
    <ul>
      <li v-for="(example, index) in examples" :key="index">
        <a href="#" @click.prevent="select(example)">
          {{ locObj(example.label) }}
        </a>
        <template v-if="example.hint"> – <span v-html="locObj(example.hint)" /></template>
      </li>
    </ul>
  </section>
</template>
