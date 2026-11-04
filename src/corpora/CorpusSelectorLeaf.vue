<script setup lang="ts">
import { useAuth } from "@/auth/useAuth"
import { computed, ref } from "vue"
import { useLocale } from "@/i18n/useLocale"
import { useAppStore } from "@/store/useAppStore"
import type { Corpus } from "@/core/config/corpusConfig.types"
import settings from "@/core/config"

const props = defineProps<{
  corpus: Corpus
}>()

const { locObj } = useLocale()
const auth = useAuth()
const store = useAppStore()

// Track whether initial corpus selection is done
const open = ref(false)

const corpusId = computed(() =>
  settings.parallel ? props.corpus.id.split("-")[0] : props.corpus.id,
)

function toggleCorpusSelection(corpus: Corpus, exclusive: boolean) {
  if (corpus.protected && !auth.hasCredential(corpus.id)) return
  // REM: An 'exclusive' click (alt-click or ctrl-click) deselects everything else
  if (exclusive) {
    store.corpus = [corpus.id]
  } else {
    if (store.corpus.indexOf(corpus.id) !== -1) {
      store.corpus = store.corpus.filter((corpusId) => corpusId !== corpus.id)
    } else {
      store.corpus.push(corpus.id)
    }
  }
}
</script>

<template>
  <div class="corpus px-1" :class="{ 'bg-primary-subtle': corpus.selected }">
    <div class="hstack">
      <label
        class="flex-grow-1 cursor-pointer"
        @click.prevent="toggleCorpusSelection(corpus, $event.altKey || $event.ctrlKey)"
        @keydown.space.prevent="toggleCorpusSelection(corpus, false)"
      >
        <fa-icon
          v-if="corpus.protected && !auth.hasCredential(corpus.id)"
          icon="fa-solid fa-lock"
          size="sm"
          class="me-2 text-danger"
        />
        <input
          v-else
          type="checkbox"
          class="form-check-input me-2 pe-none"
          :checked="corpus.selected"
        />{{ locObj(corpus.title) }}
      </label>

      <fa-icon
        v-if="corpus.protected && auth.hasCredential(corpus.id)"
        icon="fa-solid fa-lock-open"
        class="m-1 text-success"
      />
      <button
        v-if="!open"
        type="button"
        class="btn btn-link link-secondary p-0"
        @click="open = true"
      >
        <fa-icon icon="fa-solid fa-circle-info" />
      </button>
      <button v-else type="button" class="btn btn-link p-0" @click="open = false">
        <fa-icon icon="fa-solid fa-xmark" />
      </button>
    </div>

    <div v-if="open" class="p-1 pb-3">
      <div class="card">
        <div class="card-body">
          <div v-if="corpus.description" v-html="locObj(corpus.description)" class="font-body" />

          <div v-if="corpus.protected" class="my-3">
            <template v-if="!auth.hasCredential(corpus.id)">
              <fa-icon icon="fa-solid fa-lock" class="text-danger" />
              {{ $t("corpus.protected") }}
            </template>
            <template v-else>
              <fa-icon icon="fa-solid fa-lock-open" class="text-success" />
              {{ $t("corpus.protected_access") }}
            </template>
          </div>

          <div v-if="settings.corpus_info_link" class="my-3">
            <a
              :href="locObj(settings.corpus_info_link.url_template).replace('%s', corpusId)"
              target="_blank"
              class="icon-link"
            >
              {{ locObj(settings.corpus_info_link.label) }}
              <fa-icon icon="fa-solid fa-arrow-up-right-from-square" size="xs" />
            </a>
          </div>

          <table class="table table-sm my-3 w-auto">
            <tbody>
              <tr>
                <th>{{ $t("corpus.info.id") }}</th>
                <td class="ps-2">
                  <code>{{ corpus.id }}</code>
                </td>
              </tr>
              <tr v-if="corpus.info.Size">
                <th>{{ $t("corpus.info.size") }}</th>
                <td class="ps-2 text-end">{{ $n(parseInt(corpus.info.Size)) }}</td>
              </tr>
              <tr v-if="corpus.info.Sentences">
                <th>{{ $t("corpus.info.sentences") }}</th>
                <td class="ps-2 text-end">{{ $n(parseInt(corpus.info.Sentences)) }}</td>
              </tr>
              <tr v-if="corpus.info.FirstDate && corpus.info.LastDate">
                <th>{{ $t("corpus.info.timespan") }}</th>
                <td class="ps-2 text-end">
                  {{ $d(new Date(corpus.info.FirstDate)) }}–{{ $d(new Date(corpus.info.LastDate)) }}
                </td>
              </tr>
              <tr v-if="corpus.info.Updated">
                <th>{{ $t("corpus.info.updated") }}</th>
                <td class="ps-2 text-end">{{ $d(new Date(corpus.info.Updated)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
details:not(.bg-primary-subtle) > summary:hover,
.corpus:not(.bg-primary-subtle):hover {
  background-color: var(--bs-tertiary-bg);
}
</style>
