<script lang="ts" setup>
import { useI18n } from "vue-i18n"

const { locale } = useI18n()
</script>

<template>
  <footer class="container-fluid py-5 shadow-sm bg-dark text-light">
    <div class="row w-max-xl mx-auto text-center">
      <!-- Left -->
      <div class="col-lg-4 text-lg-start">
        <div>
          <a :href="$t('links.sbx.url')" target="_blank">
            <img
              src="@/assets/sprakbankentext-light.svg"
              alt="Språkbanken Text"
              class="inline-block mb-2"
              style="height: 2rem"
            />
          </a>
        </div>
        <ul class="list-unstyled">
          <li>
            <a :href="$t('links.about.url')" target="_blank">
              {{ $t("links.about.label") }}
            </a>
          </li>
          <li>
            <a :href="$t('links.news.url')" target="_blank">
              {{ $t("links.news.label") }}
            </a>
          </li>
          <li>
            <a :href="$t('links.platforms.url')" target="_blank">
              {{ $t("links.platforms.label") }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Center -->
      <div class="col-lg-4">
        <ul class="list-unstyled">
          <li>
            <a :href="$t('links.contact.url')" target="_blank">
              {{ $t("links.contact.label") }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Right -->
      <div class="col-lg-4 text-lg-end">
        <a :href="$t('links.gu.url')" target="_blank">
          <img
            v-if="locale == 'swe'"
            src="@/assets/gu-logo-white-sv.svg"
            alt="Göteborgs universitet"
            class="inline-block mb-2"
          />
          <img
            v-else
            src="@/assets/gu-logo-white-en.svg"
            alt="University of Gothenburg"
            class="inline-block mb-2"
          />
        </a>
      </div>
    </div>
  </footer>
</template>
