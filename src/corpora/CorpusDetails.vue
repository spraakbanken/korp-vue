<script lang="ts" setup>
import { useAuth } from "@/auth/useAuth"
import settings from "@/core/config"
import type { Corpus } from "@/core/config/corpusConfig.types"
import { useLocale } from "@/i18n/useLocale"
import { computed } from "vue"

const props = defineProps<{
  corpus: Corpus
}>()

defineEmits<{
  (e: "close"): void
}>()

const auth = useAuth()
const { locObj } = useLocale()

const corpusId = computed(() =>
  settings.parallel ? props.corpus.id.split("-")[0] : props.corpus.id,
)
</script>

<template>
  <div class="card">
    <div class="card-header d-flex align-items-baseline gap-2">
      <h5 class="mb-0">{{ locObj(corpus.title) }}</h5>
      <code class="text-muted">{{ corpus.id }}</code>
      <button class="btn btn-close ms-auto align-self-center" @click="$emit('close')"></button>
    </div>
    <div class="card-body">
      <div v-if="corpus.description" v-html="locObj(corpus.description)"></div>

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
              {{ $d(new Date(corpus.info.FirstDate)) }} –
              {{ $d(new Date(corpus.info.LastDate)) }}
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
</template>
