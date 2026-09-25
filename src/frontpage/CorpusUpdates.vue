<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { isRecent } from "@/core/time"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { useToggle } from "@vueuse/core"

const COLLAPSED_MAX = 5
const LIMIT_DAYS = 180

const [isExpanded, toggle] = useToggle()
const { locObj } = useLocale()
const store = useAppStore()

const recentUpdates = corpusListing.corpora
  .filter((corpus) => corpus.info.updated && isRecent(new Date(corpus.info.updated), LIMIT_DAYS))
  .sort((a, b) => new Date(b.info.updated!).getTime() - new Date(a.info.updated!).getTime())

function select(corpusId: string) {
  store.corpus = [corpusId]
}
</script>

<template>
  <div v-if="recentUpdates.length">
    <h4>{{ $t("frontpage.updates") }}</h4>
    <table class="table table-sm table-flush align-middle font-data">
      <thead>
        <tr>
          <th>{{ $t("corpus") }}</th>
          <th colspan="2">{{ $t("frontpage.updates.updated") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="corpus in isExpanded ? recentUpdates : recentUpdates.slice(0, COLLAPSED_MAX)"
          :key="corpus.id"
        >
          <td>
            {{ locObj(corpus.title) }}
          </td>
          <td>
            <time :datetime="corpus.info.updated">
              {{ corpus.info.updated }}
            </time>
          </td>
          <td class="text-center">
            <button class="btn btn-secondary btn-sm icon-link" @click="select(corpus.id)">
              {{ $t("frontpage.updates.select") }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="text-center">
      <button
        v-if="recentUpdates.length > COLLAPSED_MAX"
        class="btn btn-outline-secondary"
        @click="toggle()"
      >
        <fa-icon :icon="`fa-solid ${isExpanded ? 'fa-angles-up' : 'fa-angles-down'}`" />
        {{ isExpanded ? $t("show_less") : $t("show_more") }}
      </button>
    </div>
  </div>
</template>
