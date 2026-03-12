<script setup lang="ts">
import { splitFirst } from "@/core/util"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref, watchEffect } from "vue"
import SaveSearchButton from "./SaveSearchButton.vue"
import HelpBadge from "@/components/HelpBadge.vue"
import useSearchStore from "./useSearchStore"

const store = useAppStore()
const searchStore = useSearchStore()

const { in_order, search } = storeToRefs(store)
const cqpLocal = ref("[]")
const freeOrder = ref(!in_order.value)

watchImmediate(search, () => {
  // For advanced, `search` is `"cqp|<query>"`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "cqp" || !value) return

  // Replace input text
  cqpLocal.value = value

  // Trigger search
  searchStore.commitCqp(cqpLocal.value)
})

watchEffect(() => (freeOrder.value = !in_order.value))

function submit() {
  store.cqp = cqpLocal.value
  store.in_order = !freeOrder.value
  store.search = `cqp|${cqpLocal.value}`
  store.page = 0
  searchStore.commitCqp(cqpLocal.value)
}
</script>

<template>
  <form @submit.prevent="submit" class="w-max-md d-flex flex-column gap-4 align-items-center">
    <div>
      <label for="advanced-search-textarea" class="form-label">
        {{ $t("search.advanced.label") }}
      </label>
      <textarea
        id="advanced-search-textarea"
        cols="80"
        class="form-control font-monospace"
        spellcheck="false"
        v-model="cqpLocal"
      />

      <details class="text-muted">
        <summary class="my-1">{{ $t("search.advanced.help.heading") }}</summary>

        <p>{{ $t("search.advanced.help.summary") }}</p>

        <p>
          <strong>{{ $t("search.advanced.help.example") }}</strong>
          {{}}
          <code>[word = "sina" & pos != "VB"] [word = "b[øö]c?ker"]</code>
        </p>

        <div>
          {{ $t("search.advanced.help.read_more") }}
        </div>
        <ul class="mb-0">
          <li>
            <a
              href="https://www.gu.se/sites/default/files/2021-03/Att%20so%CC%88ka%20i%20Korp%20med%20CQP%20och%20Regexp.pdf"
              target="_blank"
            >
              🗎 {{ $t("search.advanced.help.guide") }}
            </a>
          </li>
          <li>
            <a href="https://cwb.sourceforge.io/files/CQP_Manual.pdf" target="_blank">
              🗎 {{ $t("search.advanced.help.manual") }}
            </a>
          </li>
        </ul>
      </details>
    </div>

    <div class="w-100 d-flex flex-column flex-lg-row gap-4">
      <div class="flex-grow-1">
        <div class="form-label">
          {{ $t("search.advanced.current_query", [$t("search.simple")]) }}
        </div>
        <div>
          <code>{{ searchStore.cqpSimple }}</code>
        </div>
      </div>

      <div class="flex-grow-1">
        <div class="form-label">
          {{ $t("search.advanced.current_query", [$t("search.extended")]) }}
        </div>
        <div>
          <code>{{ searchStore.cqpExtended }}</code>
        </div>
      </div>
    </div>

    <div class="hstack justify-content-center gap-2">
      <!-- "Free order" option -->
      <div class="form-check">
        <input
          type="checkbox"
          id="search-advanced-free-order"
          v-model="freeOrder"
          class="form-check-input"
        />
        <label for="search-advanced-free-order" class="form-check-label">
          {{ $t("search.free_order") }}
          <HelpBadge
            :text="$t('search.advanced.free_order.help', { free_order: $t('search.free_order') })"
          />
        </label>
      </div>

      <div class="btn-group">
        <input type="submit" :value="$t('search')" class="btn btn-primary" />
        <SaveSearchButton :query="cqpLocal" />
      </div>
    </div>
  </form>
</template>
