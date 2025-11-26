<script setup lang="ts">
import { corpusListing } from "@/core/corpora/corpusListing"
import { isRecent } from "@/core/util"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import { useToggle } from "@vueuse/core"

const COLLAPSED_MAX = 5
const LIMIT_DAYS = 180

const [isExpanded, toggle] = useToggle()
const { locObj } = useLocale()
const store = useAppStore()

const recentUpdates = corpusListing.corpora
  .filter((corpus) => corpus.info.Updated && isRecent(new Date(corpus.info.Updated), LIMIT_DAYS))
  .sort((a, b) => new Date(b.info.Updated!).getTime() - new Date(a.info.Updated!).getTime())

function select(corpusId: string) {
  store.corpus = [corpusId]
}
</script>

<template>
  <div v-if="recentUpdates.length">
    <h4>{{ $t("frontpage.updates") }}</h4>
    <ul class="list-unstyled">
      <li
        v-for="corpus in isExpanded ? recentUpdates : recentUpdates.slice(0, COLLAPSED_MAX)"
        :key="corpus.id"
        class="mb-2"
      >
        <div class="d-flex justify-content-between align-items-baseline">
          <div>
            <i18n-t scope="global" keypath="frontpage.updates.item">
              <template #title>
                <strong>{{ locObj(corpus.title) }}</strong>
              </template>
            </i18n-t>
            <button class="btn btn-outline-secondary btn-sm ms-1" @click="select(corpus.id)">
              {{ $t("frontpage.updates.select") }}
            </button>
          </div>

          <small class="text-nowrap">
            <time datetime="{{ corpus.info.Updated }}">
              {{ corpus.info.Updated }}
            </time>
          </small>
        </div>
      </li>
    </ul>
    <button v-if="recentUpdates.length > COLLAPSED_MAX" class="btn btn-link p-0" @click="toggle()">
      {{ isExpanded ? $t("show_less") : $t("show_more") }}
    </button>
  </div>
</template>
