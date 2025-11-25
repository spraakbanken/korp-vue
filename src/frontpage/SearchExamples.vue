<script setup lang="ts">
import type { SearchExample } from "@/core/config/instanceConfig.types"
import type { Store } from "@/core/model/store"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { shuffle } from "lodash"

const props = defineProps<{
  items: SearchExample[]
}>()

const store = useAppStore()
const { locObj } = useLocale()

// Pick 3 random examples
const examples = shuffle(props.items).slice(0, 3)

function select(example: SearchExample) {
  for (const key in example.params) {
    // @ts-expect-error Not sure why store[key] is "never"...
    store[key] = (example.params as Store)[key]
  }
  // TODO Replace with store.$patch. But:
  // The store only propagates to URL when using individual assignments
  // (and only triggers reactivity when URL value changes?)
  // So use $watch for URL updates?
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
