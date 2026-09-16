<script setup lang="ts">
import OptionsBar from "@/components/OptionsBar.vue"
import settings from "@/core/config"
import { formatDecimals } from "@/core/i18n"
import type { MarkerData } from "@/core/statistics/map"
import { MapModel } from "@/core/statistics/MapModel"
import { ExampleTask } from "@/core/task/ExampleTask"
import type { MapTask } from "@/core/task/MapTask"
import { goldenOklch, regescape } from "@/core/util"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useElementVisibility, whenever } from "@vueuse/core"
import { groupBy } from "lodash-es"
import { computed, onMounted, ref, useId, useTemplateRef, watch, watchEffect } from "vue"
import { useI18n } from "vue-i18n"
import { useMatomo } from "vue3-matomo"
import SeriesLegend from "./SeriesLegend.vue"
import { useTheme } from "@/components/useTheme"
import { useResult } from "./useResult"
import ResultsDisplay from "./ResultsDisplay.vue"

const props = defineProps<{
  task: MapTask
}>()

const progress = defineModel<number>("progress")

const { createTab } = useDynamicTabs()
const { t } = useI18n()
const matomo = useMatomo()
const theme = useTheme()

const id = useId()
const mapEl = useTemplateRef("map")
const isMapVisible = useElementVisibility(mapEl)
const enableClustering = ref(false)
const enabledSeries = ref<string[]>([])
const markersList = ref<MarkerData[]>([])

const model = computed(() => {
  if (!mapEl.value) return
  const model = new MapModel(
    mapEl.value!,
    (markers) => (markersList.value = markers.sort((a, b) => b.point.rel - a.point.rel)),
    () => (markersList.value = []),
  )
  model.setCenter(settings["map_center"])
  return model
})

/** Selected markers grouped by location. Makes a difference when clustering is enabled. */
const markersGrouped = computed<Record<string, MarkerData[]>>(() =>
  groupBy(markersList.value, (marker) => marker.point.name),
)

/** List of label-color tuples */
const legend = computed(() =>
  Object.entries(data.value || {}).map(([label, series]) => ({ label, color: series.color })),
)

onMounted(() => {
  loadResult()
  matomo.value?.trackEvent("Map", "New")
})

async function load() {
  await props.task.send()
  const palette = goldenOklch(theme.primary)
  return props.task.getMarkerGroups(() => palette.next().value!)
}

const { data, loadResult } = useResult(progress, load, props.task)

// Enable all series when data arrives
watchEffect(() => (enabledSeries.value = Object.keys(data.value || {})))

// Update map to reflect clustering/series selection
watch([enableClustering, enabledSeries], () => {
  if (!model.value) return
  model.value.useClustering = enableClustering.value
  const series = enabledSeries.value.map((label) => data.value![label])
  model.value.updateMarkers(series, "gray")
})

whenever(isMapVisible, () => model.value?.map.invalidateSize())

function onMarkerClick(marker: MarkerData) {
  const { point, queryData } = marker
  const location = [point.name, point.countryCode, point.lat, point.lng].join(";")
  const cqpGeo = `<match> [_.${queryData.label} contains "${regescape(location)}"] []{0,} </match>`

  const cqps = [queryData.searchCqp, queryData.subCqp, cqpGeo]
  const readingMode = queryData.label === "paragraph__geocontext"
  const task = new ExampleTask(queryData.corpora, cqps, queryData.within, readingMode)
  createTab(() => t("result.kwic"), task)
  matomo.value?.trackEvent("Map", "Subsearch")
}
</script>

<template>
  <div class="vstack gap-2">
    <!-- Search options bar -->
    <OptionsBar>
      <div class="form-check">
        <input
          type="checkbox"
          :id="id + '-cluster'"
          v-model="enableClustering"
          class="form-check-input"
        />
        <label :for="id + '-cluster'" class="form-check-label">
          {{ $t("result.map.cluster") }}
        </label>
      </div>
    </OptionsBar>

    <ResultsDisplay :populated="props.task.hasData()" class="vstack gap-2">
      <!-- Toggleable legend -->
      <SeriesLegend :legend v-model="enabledSeries" />

      <!-- Stacking container -->
      <div class="w-100 position-relative" style="height: 90svh">
        <!-- Map target -->
        <div ref="map" class="position-absolute w-100 h-100 z-0" />

        <!-- Place info on hover/click -->
        <div
          v-if="markersList.length"
          class="hover-info-container position-absolute end-0 p-1 z-1"
          style="width: 15rem"
        >
          <div v-for="(markers, location) in markersGrouped" :key="location" class="card mb-1">
            <div class="card-body p-2">
              <div class="fw-bold">
                {{ location }}
              </div>
              <div
                v-for="marker in markers"
                :key="marker.label"
                class="hstack align-items-baseline position-relative"
              >
                <div class="swatch" :style="{ backgroundColor: marker.color }" />
                <div class="flex-grow-1">
                  <div>
                    <a
                      href="#"
                      class="stretched-link text-decoration-none fw-bold"
                      @click.prevent="onMarkerClick(marker)"
                    >
                      {{ marker.label }}
                    </a>
                  </div>
                  <div>{{ $t("stat.freq") }}: {{ marker.point.abs }}</div>
                  <div>
                    {{ $t("stat.freq_relative") }}: {{ formatDecimals(marker.point.rel, 2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResultsDisplay>
  </div>
</template>

<style>
.leaflet-div-icon {
  background: none;
  border: none;
}

.cluster-geokorp-marker-group {
  position: absolute;
  bottom: 0;
  width: 40px;
}

.cluster-geokorp-marker {
  width: 10px;
  border-radius: 1px;
  display: inline-block;
}

.marker-top .geokorp-multi-marker {
  vertical-align: top;
}

.marker-middle .geokorp-multi-marker {
  vertical-align: middle;
}

.marker-bottom .geokorp-multi-marker {
  vertical-align: bottom;
}

.geokorp-multi-marker {
  opacity: 0.85;
  display: inline-block;
}

.geokorp-marker {
  opacity: 0.93;
}

.cluster-text {
  font-weight: bold;
}

.cluster-icon {
  border-radius: 15px;
  width: 30px !important;
  height: 30px !important;
  z-index: 400;
  position: absolute;
  padding-top: 5px;
  padding-left: 1px;
}

.swatch {
  width: 10px;
  height: 10px;
  display: inline-block;
  margin-right: 5px;
}
</style>
