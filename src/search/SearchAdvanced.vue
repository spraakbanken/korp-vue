<script setup lang="ts">
import { splitFirst } from "@/core/util"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref } from "vue"

const store = useAppStore()

const { search, simpleCqp, extendedCqp } = storeToRefs(store)
const cqpLocal = ref("[]")

watchImmediate(search, () => {
  // For advanced, `search` is `"cqp|<query>"`
  const [type, value] = splitFirst("|", store.search || "")
  if (type != "cqp" || !value) return

  // Replace input text
  cqpLocal.value = value

  // Trigger search
  commitSearch()
})

function submit() {
  store.cqp = cqpLocal.value
  store.search = `cqp|${cqpLocal.value}`
  commitSearch()
}

function commitSearch() {
  store.activeSearch = { cqp: cqpLocal.value }
}
</script>

<template>
  <form
    @submit.prevent="submit"
    class="d-flex flex-column gap-4 align-items-center"
    style="max-width: 50em"
  >
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
          {{ " " }}
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
          <code>{{ simpleCqp }}</code>
        </div>
      </div>

      <div class="flex-grow-1">
        <div class="form-label">
          {{ $t("search.advanced.current_query", [$t("search.extended")]) }}
        </div>
        <div>
          <code>{{ extendedCqp }}</code>
        </div>
      </div>
    </div>

    <input type="submit" :value="$t('search')" class="btn btn-primary" />
  </form>
</template>
